# Guía de Configuración: Sistema de Devocionales

Para que el panel de administración (`web-externa/admin.html`) funcione y pueda subir devocionales a tu App, necesitas configurar Firebase y GitHub.

## 1. Configurar Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/) y crea un nuevo proyecto (o usa uno existente).
2. **Autenticación**:
   - Menú "Authentication" > "Sign-in method".
   - Menú "Authentication" > "Sign-in method".
   - Habilita **Correo electrónico/contraseña**.
   - Ve a la pestaña **Users** y "Add user" para crear tu cuenta de administrador (email y contraseña).
3. **Firestore Database**:
   - Menú "Firestore Database" > "Create Database".
   - Inicia en **modo producción**.
   - **Reglas de Seguridad**: Copia estas reglas para que SOLO TÚ puedas leer la configuración (reemplaza `TU_UID` con tu User UID que verás en la sección Authentication después de loguearte la primera vez, o usa reglas basadas en email):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /config/github {
            // Solo permitir lectura si el usuario está autenticado
            allow read: if request.auth != null;
            // Solo permitir escritura manualmente desde consola o si eres tú
            allow write: if request.auth != null; 
         }
       }
     }
     ```
4. **Obtener Configuración Web**:
   - Ve a "Project Settings" (engranaje) > "General".
   - Baja a "Your apps" y crea una Web App `</>`.
   - Copia el objeto `const firebaseConfig = { ... }`.
   - **PÉGALO** en `web-externa/js/admin.js` (Líneas 2-9).

## 2. Configurar GitHub (Token de Acceso)

Para que el panel pueda subir archivos a tu repositorio, necesita un permiso especial.

1. Ve a [GitHub Tokens](https://github.com/settings/tokens).
2. Genera un **New personal access token (Classic)**.
3. Nombre: `Admin Devocionales App`.
4. Expiración: "No expiration" (o renuévalo manualmente).
5. **Scopes (Permisos)**: Marca la casilla **`repo`** (Full control of private repositories) y `workflow` si usas Actions.
6. Copia el token generado (empieza por `ghp_...`).

## 3. Primer Uso del Panel Admin

1. Sube la carpeta `web-externa` a tu hosting (Vercel, Firebase Hosting, etc.). El usuario indicó: `https://dataconnect-kohl.vercel.app/biblia-cristiana-rv1960-app/admin.html`.
2. Abre la URL del admin (`admin.html`).
3. Inicia sesión con Google.
4. Aparecerá un cuadro de **"Configuración Inicial"**.
5. Pega tu **GitHub Token** y el nombre de tu repositorio (`krafairus/dataconnect`).
6. Dale a guardar. ¡Listo!

Ahora puedes redactar y publicar devocionales desde la interfaz.
