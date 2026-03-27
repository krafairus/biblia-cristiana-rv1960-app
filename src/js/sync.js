import { Databases, Query } from 'appwrite';

class SyncService {
    constructor(auth) {
        this.auth = auth;
        this.databases = new Databases(auth.client);
        this.databaseId = 'bible_db'; // PLACEHOLDER
        this.collections = {
            favorites: 'favorites',
            notes: 'notes',
            highlights: 'highlights',
            devotionalFavorites: 'devotional_favorites'
        };
        this.isSyncing = false;
    }

    async syncAll(db) {
        if (this.isSyncing) return;
        const user = await this.auth.getCurrentUser();
        if (!user) return;

        this.isSyncing = true;
        try {
            console.log("Iniciando sincronización completa...");
            await this.pushChanges(db);
            await this.pullChanges(db);
            console.log("Sincronización completada con éxito.");
        } catch (error) {
            console.error("Error en sincronización:", error);
        } finally {
            this.isSyncing = false;
        }
    }

    async pushChanges(db) {
        for (const [key, collectionId] of Object.entries(this.collections)) {
            const items = db[key] || [];
            const dirtyItems = items.filter(item => item.isDirty);
            
            if (dirtyItems.length > 0) {
                console.log(`[Sync] Sincronizando ${dirtyItems.length} cambios en ${collectionId}...`);
            }

            for (const item of dirtyItems) {
                try {
                    await this.syncItemToCloud(collectionId, item);
                    item.isDirty = false;
                    // Si estaba marcado como borrado y ya se subió, podemos eliminarlo físicamente de local
                    if (item.isDeleted) {
                        const idx = items.findIndex(i => i.syncId === item.syncId);
                        if (idx > -1) items.splice(idx, 1);
                    }
                } catch (e) {
                    console.error(`[Sync] Error en ${collectionId} (${item.syncId}):`, e);
                }
            }
        }
        db.saveAll();
    }

    async syncItemToCloud(collectionId, item) {
        const docId = item.syncId;
        
        // Clonar y filtrar SOLO los campos que Appwrite espera (Whitelist)
        // Esto evita errores de "Unknown attribute" por campos como 'title' o 'pinned'
        const data = {};
        
        // Campos comunes
        data.uuid = item.syncId; 
        if (item.dateUpdated) data.dateUpdated = item.dateUpdated;
        if (item.isDeleted !== undefined) data.isDeleted = item.isDeleted;

        // Atributos específicos por colección
        if (collectionId === 'notes' || collectionId === 'highlights' || collectionId === 'favorites') {
            // Campos de referencia bíblica
            if (item.book) data.book = item.book;
            if (item.chapter !== undefined) data.chapter = parseInt(item.chapter);
            if (item.verse !== undefined) data.verse = parseInt(item.verse);
            if (item.text) data.text = item.text;

            if (collectionId === 'notes') {
                data.notes = item.notes || "";
                if (item.title) data.title = item.title;
            } else if (collectionId === 'highlights' && item.color) {
                data.color = item.color;
            }
        } else if (collectionId === 'devotional_favorites') {
            // Campos específicos de devocionales
            if (item.titulo) data.titulo = item.titulo;
            if (item.fecha_hora) data.fecha_hora = item.fecha_hora;
            if (item.parrafo) data.parrafo = item.parrafo;
            // No enviamos book/chapter/verse para devocionales a menos que el servidor lo exija
        }

        console.log(`[Sync] Enviando datos a ${collectionId}:`, data);

        try {
            // Intentar actualizar primero
            await this.databases.updateDocument(this.databaseId, collectionId, docId, data);
        } catch (e) {
            if (e.code === 404) {
                // Si no existe, crear
                await this.databases.createDocument(this.databaseId, collectionId, docId, data);
            } else {
                throw e;
            }
        }
    }

    async pullChanges(db) {
        const lastSync = db.syncMetadata.last_sync || 0;
        const now = Date.now();

        for (const [key, collectionId] of Object.entries(this.collections)) {
            try {
                // Appwrite no tiene updatedAt > timestamp directo en queries simples sin índices, 
                // pero asumimos que tenemos el atributo habilitado o traemos lo nuevo.
                const response = await this.databases.listDocuments(
                    this.databaseId, 
                    collectionId,
                    [Query.greaterThan('dateUpdated', new Date(lastSync).toISOString())]
                );

                for (const remoteItem of response.documents) {
                    this.mergeItem(db, key, remoteItem);
                }
            } catch (e) {
                console.warn(`No se pudo realizar pull de ${collectionId}:`, e);
            }
        }

        db.syncMetadata.last_sync = now;
        db.saveAll();
    }

    mergeItem(db, key, remoteItem) {
        const localItems = db[key];
        const localIdx = localItems.findIndex(i => i.syncId === remoteItem.$id || i.syncId === remoteItem.syncId);
        const cleanRemote = { ...remoteItem, syncId: remoteItem.$id };
        
        // Ya no hace falta mapeo inverso porque local y remoto coinciden
        
        delete cleanRemote.$id;
        delete cleanRemote.$collectionId;
        delete cleanRemote.$databaseId;
        delete cleanRemote.$createdAt;
        delete cleanRemote.$updatedAt;
        delete cleanRemote.$permissions;

        if (localIdx > -1) {
            const localItem = localItems[localIdx];
            // Aseguramos que tenemos fechas para comparar
            const localDate = new Date(localItem.dateUpdated || 0).getTime();
            const remoteDate = new Date(cleanRemote.dateUpdated || 0).getTime();

            if (remoteDate > localDate) {
                // El remoto es más nuevo (LWW)
                if (cleanRemote.isDeleted) {
                    // Si el remoto dice que está borrado, lo quitamos físicamente de local
                    localItems.splice(localIdx, 1);
                } else {
                    // Mezcla selectiva: No sobrescribir con undefined para campos que el remoto no tiene
                    Object.keys(cleanRemote).forEach(key => {
                        if (cleanRemote[key] !== undefined && cleanRemote[key] !== null) {
                            localItem[key] = cleanRemote[key];
                        }
                    });
                    localItem.isDirty = false;
                }
            }
        } else {
            // No existe localmente, añadirlo si no está marcado como borrado en remoto
            if (!cleanRemote.isDeleted) {
                localItems.push({ ...cleanRemote, isDirty: false });
            }
        }
    }
}

export { SyncService };
