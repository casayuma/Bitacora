# Bitácora de Recepción — Casa Yuma

App en tiempo real para reemplazar el Excel de bitácora. Corre en GitHub Pages
+ Firebase Firestore, igual que Academia, Dashboard y el resto de tus
herramientas.

## Qué resuelve

- **Pendientes Abiertos**: bandeja en vivo, ordenada por antigüedad, visible
  para los 3 turnos al mismo tiempo. Muestra cuántos días lleva abierto cada
  pendiente (se pone en rojo a partir de 7 días) — así ya no se pierden.
- **Cierre real**: un pendiente solo desaparece de la bandeja cuando alguien
  explícitamente le da "Cerrar" y escribe una nota de cierre. Queda registrado
  quién lo cerró y cuándo.
- **Hilos de seguimiento**: cada pendiente tiene su propio historial de
  comentarios (quién dijo qué y cuándo), en vez de sobrescribir una sola
  celda como en el Excel.
- **Historial completo**: los 5,894 registros del Excel + todo lo nuevo,
  buscable y filtrable por turno/estatus.
- **PIN individual**: cada recepcionista tiene su propio PIN, así queda
  registrado quién anotó y quién dio seguimiento a cada cosa.

## Paso 1 — Crear el proyecto de Firebase

1. Ve a https://console.firebase.google.com → "Agregar proyecto".
   Sugerencia de nombre: `casayuma-bitacora`.
2. Dentro del proyecto: **Build > Firestore Database > Crear base de datos**
   (modo producción, región `us-central` o la que ya uses en tus otros
   proyectos).
3. **Build > Authentication > Sign-in method** → habilita **Anónimo**.
   (Esto es solo para que las reglas de seguridad de Firestore puedan exigir
   `request.auth != null` y bloquear el acceso a quien no pase por la app —
   no le pide nada al usuario, es invisible para las recepcionistas).
4. Ve a **Configuración del proyecto (⚙️) > Tus apps > Web (`</>`)**, registra
   una app y copia el bloque `firebaseConfig`.
5. Pega ese bloque en `firebase-config.sample.js` y renombra el archivo a
   `firebase-config.js`.
6. En **Firestore Database > Reglas**, pega el contenido de `firestore.rules`
   (incluido en esta carpeta) y publica.

## Paso 2 — Dar de alta a las recepcionistas

1. Abre `admin.html` en el navegador (localmente o ya subido a GitHub Pages).
2. El PIN maestro por defecto es `4477` — **cámbialo** editando la constante
   `MASTER_PIN` dentro de `admin.html` antes de publicarlo.
3. Agrega cada recepcionista con su nombre y un PIN individual de 4 dígitos
   (Rodolfo, Sofía, Brenda, Mackye, Esther, Yaneth, Cinthya, Eduardo,
   Horacio, y quien falte).
4. Cada quien usará su propio PIN para entrar a `index.html`.

## Paso 3 — Migrar el historial del Excel

Ya extraje y limpié los 5,894 registros no vacíos del Excel a
`migrate/bitacora_historico.json`. Notas de la limpieza:

- Turnos con valores raros (`"Turno"`, `"z"`, vacíos) quedaron como `null`.
- De los 5,894, **5,134 no traían estatus** en el Excel original — se
  migran con la etiqueta `"Sin estatus (histórico)"`, visibles en el
  Historial pero **no** en la bandeja de Pendientes (para no revivir cosas
  ya resueltas en la práctica).
- Los que sí traían Pendiente / Acción Requerida / Esperando Respuesta se
  migran también como históricos de solo consulta — la bandeja de
  Pendientes Abiertos arranca limpia el día que lancen la app.

Para migrar:

```bash
cd migrate
npm install firebase-admin
# Descarga tu Service Account Key (Configuración del proyecto > Cuentas de
# servicio > Generar nueva clave privada) y guárdala aquí como
# serviceAccountKey.json — NO la subas a GitHub.
node migrate.js
```

## Paso 4 — Publicar en GitHub Pages

```bash
# dentro del repo casayuma/Bitacora (o el nombre que prefieras)
git add index.html admin.html firebase-config.js firestore.rules
git commit -m "Bitácora de recepción v1"
git push
```

Actívalo en Settings > Pages, igual que tus otras herramientas. Quedaría en
algo como `casayuma.github.io/Bitacora`.

## Notas de seguridad

El PIN de cada recepcionista se guarda hasheado (SHA-256), nunca en texto
plano. Aun así, como es una app 100% estática (sin servidor propio), la
`apiKey` de Firebase queda visible en el código fuente — esto es normal y
el mismo esquema que usan tus otras herramientas; la protección real está
en las reglas de Firestore (`firestore.rules`), que exigen sesión anónima
para leer o escribir.

## Archivos en esta carpeta

| Archivo | Qué hace |
|---|---|
| `index.html` | App principal (login, pendientes, nueva entrada, historial) |
| `admin.html` | Alta/baja de recepcionistas y sus PINs |
| `firebase-config.sample.js` | Plantilla — renombrar a `firebase-config.js` |
| `firestore.rules` | Reglas de seguridad recomendadas |
| `migrate/bitacora_historico.json` | Datos limpios del Excel, listos para importar |
| `migrate/migrate.js` | Script de importación (Node + firebase-admin) |
