# Universo Val-Ben

La app de la familia Val-Ben. Privada: solo entran, con su cuenta de Google,
los emails dados de alta en el árbol (y los admins de `ADMIN_EMAILS`).

- **🌳 Familia**: árbol genealógico (una fila por generación, parejas con ♥
  y líneas a los hijos; los 5 destacados). Solo hay que indicar de cada
  persona sus dos progenitores y su pareja: hermanos, tíos, sobrinos,
  primos, cuñados, suegros... se calculan solos (`lib/familia.ts`). Cada
  ficha tiene datos (nacimiento, teléfono con botón de llamar/WhatsApp),
  su familia, **hitos** (una lista predefinida en `lib/hitos.ts` lista para
  rellenar + los propios que se añadan), **anécdotas y curiosidades**, y las
  fotos del álbum en las que está etiquetado. Los hitos y anécdotas de
  alguien los rellena él mismo, sus padres y sus abuelos.
- **🎂 Cumpleaños**: si hoy cumple alguien, sale bien grande en la portada
  (con botón para llamarle); debajo, los próximos 45 días.
- **🍲 Recetas**: cualquiera pide una → *Pedidas* (email a padres y admin).
  Papá o mamá la empiezan → *Escribiéndose* (se puede guardar a medias).
  Al terminarla → *Listas* (email a hijos y admin). Primero ingredientes,
  luego pasos (con foto opcional en cada paso), consejos y más fotos.
  Buscador por nombre, ingrediente o texto, sin importar tildes.
- **📷 Álbum**: subir varias fotos a la vez con pie, lugar, fecha y
  personas etiquetadas. Filtro por persona. Las fotos se reducen en el
  propio móvil antes de subirlas (máx. 2000 px).
- **❓ Ayuda** (`/ayuda`) con instrucciones paso a paso, y un recuadro
  "¿Cómo funciona esto?" en cada sección.
- **✨ Novedades**: historial en `lib/version.ts` (añadir entrada arriba con
  cada cambio visible); pop-up al entrar tras una actualización.

Roles (en la ficha de cada persona, los pone el admin): **Padre/Madre**
(escriben recetas), **Hijo/Hija** (piden recetas, reciben el aviso de
lista), **Resto de la familia** (ven todo y suben fotos). El admin
(`ADMIN_EMAILS`) además añade/quita personas y edita relaciones.

Stack, igual que el resto de apps de Valdun: Next.js 14 (App Router) +
Prisma + Postgres (Neon) + NextAuth (Google) + Vercel (Blob para fotos) +
Tailwind + Vitest + Gmail SMTP para avisos.

---

## 1. Credenciales de Google (login)

1. [console.cloud.google.com](https://console.cloud.google.com) → proyecto
   nuevo "Universo Val-Ben".
2. **APIs y servicios → Pantalla de consentimiento OAuth**: tipo
   **Externo**, nombre de la app, emails de contacto. En "Usuarios de
   prueba" añade el Gmail de cada miembro de la familia que vaya a entrar
   (así no hace falta publicar la app ni pasar revisión de Google).
3. **Credenciales → Crear credenciales → ID de cliente de OAuth** →
   **Aplicación web**:
   - Orígenes autorizados: `http://localhost:3000`
   - URI de redirección: `http://localhost:3000/api/auth/callback/google`
   - Cuando tengas la URL de Vercel, añade también
     `https://tu-dominio.vercel.app` y
     `https://tu-dominio.vercel.app/api/auth/callback/google`.
4. Copia el **Client ID** y el **Client Secret** al `.env`.

## 2. Base de datos (Neon)

Ya está creada y con las tablas (`npm run db:push`). La URL con `-pooler`
va en `DATABASE_URL` y la misma sin `-pooler` en `DIRECT_URL`.

Recomendado antes de que la familia empiece a usarla: crear en Neon una
**rama** `dev` para pruebas y dejar la principal para producción (en el
`.env` local, las URLs de producción comentadas, como en los otros
proyectos). Si cambia `prisma/schema.prisma`, hay que hacer `db:push` en las
dos.

## 3. Variables de entorno

Copia `.env.example` como `.env` (ya hecho) y rellena lo que falte:
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (paso 1),
`BLOB_READ_WRITE_TOKEN` (paso 5), `ADMIN_EMAILS` (tu Gmail),
`GMAIL_USER`/`GMAIL_APP_PASSWORD` (avisos; opcional).

## 4. Probar en local

```bash
npm install
npm run dev        # muestra también la IP para abrirla desde el móvil
npm test
```

Entra con tu Gmail de `ADMIN_EMAILS` y, en **Familia → Añadir persona**,
date de alta primero a ti mismo (con tu email de Google) y luego al resto:
papá y mamá (rol Padre/Madre, pareja entre ellos, "uno de los 5"), cada
hijo (rol Hijo, eligiendo sus padres, "uno de los 5"), y luego parejas,
sobrinos, abuelos... Desde la ficha de cualquiera hay atajos para "Añadir
hijo/a" y "Añadir pareja".

**👁️ Ver como…** Fuera de producción, el admin tiene una franja azul arriba
para usar la app como cualquier persona del árbol (papá, un hermano...): ve
exactamente lo que vería esa persona y actúa como ella (pedir una receta
como un hermano, escribirla como mamá, rellenar hitos como padre...), sin
permisos de admin. "Yo (admin)" vuelve a lo normal. En producción
(`VERCEL_ENV=production`) ni aparece ni funciona.

## 5. Desplegar en Vercel

1. Sube el código a un repo de GitHub (ramas `develop` y `main`, como en
   los otros proyectos; `main` = producción).
2. [vercel.com](https://vercel.com) → Add New → Project → el repo.
3. **Storage → Create → Blob** y conéctalo al proyecto (crea solo
   `BLOB_READ_WRITE_TOKEN`). Copia ese token también a tu `.env` local
   para poder subir fotos en local.
4. En Environment Variables añade el resto de variables del `.env`, con
   `NEXTAUTH_URL` = la URL de Vercel.
5. Deploy, y añade la URL de Vercel en Google Cloud (paso 1.3).

## Avisos por email

Con `GMAIL_USER` y `GMAIL_APP_PASSWORD` (contraseña de aplicación de
[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)):
receta pedida → padres + admin; receta terminada → hijos + admin. Cada uno
puede desactivarlos o mandarlos a otro email en **Mis datos**. En local
(fuera de Vercel) no se manda ningún email: solo se escribe en la consola
lo que se habría enviado. En las previews de Vercel (`VERCEL_ENV` ≠
`production`) solo les llegan a los admins.

## Icono de la app

`logo1.png` (en la raíz) es el original. `scripts/generar-iconos.ps1` saca
de él `app/apple-icon.png` (iPhone), `app/icon.png` (pestaña),
`public/icono-192.png`/`icono-512.png` (Android) y `public/logo.png`
(barra de arriba). Si cambias el logo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\generar-iconos.ps1
```
