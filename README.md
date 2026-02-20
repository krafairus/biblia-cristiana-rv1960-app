# Biblia Cristiana RV 1960 - App Movil

Esta es una aplicación de Biblia moderna, offline y con diseño premium, construida con tecnologías web y Capacitor para dispositivos móviles.

## 🎯 Propósito

El propósito de esta aplicación es brindar a todo aquel que busca de Dios una Biblia en su dispositivo móvil, sin anuncios, sin cobros y totalmente gratuita. Se ha diseñado con un enfoque en la limpieza y la funcionalidad, evitando interfaces confusas o saturadas de opciones para ofrecer una experiencia de lectura pura y directa.

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente según tu sistema operativo:

### General (Todos los SO)
- **Node.js**: Versión 18 o superior. [Descargar aquí](https://nodejs.org/)
- **npm**: Viene instalado con Node.js.

### Para Compilar Android (Linux / Windows / macOS)
- **Java JDK 17**: Es la versión recomendada para las últimas versiones de Android/Capacitor.
- **Android Studio**: Necesario para el SDK de Android y las herramientas de compilación.
    - Asegúrate de instalar el **SDK Platform** y las **Build-Tools** recomendadas por Android Studio.
    - Configura la variable de entorno `ANDROID_HOME` apuntando a tu carpeta SDK.

---

## 🛠️ Instalación

1. Clona el repositorio o descarga los archivos.
2. Abre una terminal en la carpeta del proyecto.
3. Instala las dependencias de Node.js:
   ```bash
   npm install
   ```

---

## 💻 Desarrollo

Para ejecutar la aplicación en el navegador con recarga en vivo:
```bash
npm run dev
```

---

## 📦 Compilación

### 1. Construir la versión Web
```bash
npm run build
```
Esto generará los archivos optimizados en la carpeta `dist/`.

### 2. Sincronizar con Android
Si vas a compilar para móvil, primero construye la web y luego sincroniza Capacitor:
```bash
npm run build
npx cap sync android
```

### 3. Generar APK (Instalable)

#### En Linux / macOS:
```bash
cd android
./gradlew assembleDebug
```
El APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

#### En Windows:
```bash
cd android
gradlew.bat assembleDebug
```
(O puedes abrir la carpeta `android/` directamente en **Android Studio** y pulsar "Build > Build APK").

---

## 🎨 Recursos Especiales
- **Fuentes Locales**: Ubicadas en `assets/fonts/`. La app está configurada para funcionar 100% offline.
- **Iconos**: Generados automáticamente desde `icon.png` usando `@capacitor/assets`.

---

## 📚 Dependencias Principales
- **Vite**: Motor de construcción ultra rápido.
- **Capacitor**: Puente para funciones nativas (TTS, Share, Filesystem).
- **Lucide**: Librería de iconos vectoriales.
- **Capacitor TTS**: Motor de lectura en voz alta.

---

## ⚖️ Licencia y Descargo de Responsabilidad

Este proyecto se distribuye bajo la licencia **GNU General Public License v3.0 (GPLv3)**. Consulta el archivo `LICENSE` para más detalles.

**Descargo de Responsabilidad**: Este proyecto se distribuye "tal cual", sin garantías de ningún tipo, expresas o implícitas. El autor no se hace responsable de fallos, pérdida de datos o cualquier otro problema derivado del uso de esta aplicación. Se ofrece de manera gratuita y para fines espirituales y educativos.

---

## 📂 Repositorio y GitHub

Si vas a subir este proyecto a GitHub, ten en cuenta:
- **Carpeta `android/`**: No es necesario borrarla por completo, pero **NO** debes subir las subcarpetas de construcción interna como `android/app/build/` o `android/.gradle/` ya que pesan GBs. He creado un archivo `.gitignore` que excluye automáticamente estos archivos pesados.
- **Node Modules**: No subas la carpeta `node_modules/`.
