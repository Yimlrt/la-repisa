# La Repisa — Tienda en línea

Tienda web para vender ropa, bolsos, platos y de todo un poco. Incluye:
- Catálogo público con buscador y filtro por categoría
- Carrito de compras
- Pago por **Nequi + confirmación por WhatsApp** (sin RUT, sin pasarela, sin comisiones)
- Panel de administración para subir/editar/borrar productos con fotos

**Costo mensual: $0.** Todo corre en las capas gratuitas de Vercel y Supabase, y el cobro es directo por Nequi.

**Cómo funciona el pago:** el cliente ve el número de Nequi, hace la transferencia, llena sus datos de entrega y toca un botón que abre WhatsApp con el pedido ya redactado — ahí adjunta la foto del comprobante. El pedido queda marcado como "registrado" pero **no se despacha hasta que tu mamá confirme el comprobante recibido por WhatsApp**. Ella sigue teniendo el control final de cada envío.

---

## 0. Lo que necesitas antes de empezar
- Una cuenta de [GitHub](https://github.com) (gratis)
- Una cuenta de [Supabase](https://supabase.com) (gratis)
- Una cuenta de [Vercel](https://vercel.com) (gratis)
- El número de Nequi de tu mamá y su número de WhatsApp para recibir los comprobantes

---

## 1. Crear el proyecto en Supabase (la base de datos)

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Ponle un nombre (ej. `la-repisa`) y una contraseña para la base de datos (guárdala).
3. Cuando el proyecto esté listo, ve a **SQL Editor** → **New query**.
4. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo su contenido, pégalo ahí y dale **Run**. Esto crea la tabla de productos, el almacenamiento de fotos y los permisos de seguridad.
5. Ve a **Project Settings → API**. Ahí vas a ver:
   - **Project URL** → esto es tu `VITE_SUPABASE_URL`
   - **anon public key** → esto es tu `VITE_SUPABASE_ANON_KEY`
6. Crea el usuario administrador (para que tu mamá pueda entrar al panel): ve a **Authentication → Users → Add user**, escribe su correo y una contraseña. Con eso ya puede iniciar sesión en `/admin/login`.

## 2. Datos de pago (Nequi + WhatsApp)

No necesitas crear ninguna cuenta nueva para esto — solo necesitas dos datos que tu mamá ya tiene:
1. Su **número de Nequi** (el mismo número de celular con el que abrió la cuenta).
2. El **número de WhatsApp** donde va a recibir los comprobantes (puede ser el mismo u otro).

Con eso ya puedes llenar las variables `VITE_NEQUI_NUMBER`, `VITE_NEQUI_HOLDER` y `VITE_WHATSAPP_NUMBER` en el paso 3.

## 3. Configurar el proyecto localmente

1. Instala [Node.js](https://nodejs.org) si no lo tienes.
2. Descomprime este proyecto y abre una terminal dentro de la carpeta.
3. Copia el archivo de ejemplo de variables de entorno:
   ```
   cp .env.example .env
   ```
4. Abre `.env` y reemplaza los valores con los que copiaste de Supabase, más el Nequi y WhatsApp de tu mamá:
   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_STORE_NAME="La Repisa"
   VITE_NEQUI_NUMBER=3001234567
   VITE_NEQUI_HOLDER="Nombre de tu mamá"
   VITE_WHATSAPP_NUMBER=573001234567
   ```
   Importante: `VITE_WHATSAPP_NUMBER` va con el indicativo del país pegado y sin el símbolo `+` (Colombia es `57`).
5. Instala dependencias y corre el proyecto localmente para probarlo:
   ```
   npm install
   npm run dev
   ```
6. Abre `http://localhost:5173` en tu navegador. Ve a `/admin/login`, entra con el usuario que creaste en Supabase, y sube el primer producto para probar que todo funcione.

## 4. Subir el proyecto a GitHub

```
git init
git add .
git commit -m "Primera version de La Repisa"
```
Crea un repositorio nuevo en GitHub (puede ser privado) y sigue las instrucciones que te da GitHub para subir tu código (`git remote add origin ...` y `git push`).

## 5. Publicar gratis en Vercel

1. Entra a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub.
2. **Add New → Project** → elige el repositorio que acabas de subir.
3. En **Environment Variables**, agrega las mismas variables que pusiste en tu `.env` local (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STORE_NAME`, `VITE_NEQUI_NUMBER`, `VITE_NEQUI_HOLDER`, `VITE_WHATSAPP_NUMBER`).
4. Dale **Deploy**. En 1-2 minutos tendrás tu tienda en una URL como `la-repisa.vercel.app`, ¡gratis y ya con HTTPS!
5. Cada vez que hagas `git push` con cambios, Vercel actualiza el sitio automáticamente.

## 6. Uso del día a día para tu mamá

- Para subir productos: entra a `tudominio.vercel.app/admin/login`, inicia sesión con su usuario, y usa el formulario para agregar nombre, precio, cantidad, categoría y foto.
- Puede editar o eliminar productos en cualquier momento desde ahí mismo.
- Cuando alguien compra, le llega un mensaje de WhatsApp con el pedido y la foto del comprobante de Nequi.
  **Antes de alistar y enviar el producto, tu mamá debe verificar en su app de Nequi que el dinero sí llegó** — el sitio no lo confirma automáticamente, por eso el paso de WhatsApp es obligatorio.

## 7. Cuando quieras el dominio propio y Play Store (después)

- **Dominio propio** (ej. `larepisa.com`): lo compras donde quieras (Namecheap, GoDaddy) y lo conectas en Vercel → Project Settings → Domains. Costo aproximado: $10-12 USD/año.
- **Play Store**: cuando la web esté lista, se empaqueta como PWA usando [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (gratis) y se sube con una cuenta de desarrollador de Google Play (pago único de $25 USD). Este proyecto ya está listo para ese paso porque es responsive y funciona bien en móvil.

---

## Estructura del proyecto

```
src/
  components/     → Header, tarjeta de producto
  pages/          → Inicio, detalle de producto, carrito, pago, panel admin
  lib/            → conexión a Supabase, carrito de compras, formato de precios
supabase/
  schema.sql      → script para crear la base de datos
```

## Nota sobre el pago manual y el futuro paso a pago automático

Con Nequi + WhatsApp, la confirmación depende de que tu mamá revise cada comprobante — es 100% manual pero no requiere RUT ni papeles. Cuando el negocio crezca y tu mamá saque su RUT (es gratis y se hace en línea en la DIAN en minutos, sin necesitar cámara de comercio como persona natural), pueden activar **Wompi**, que sí acepta desembolsos directos a Nequi y deja el pago automático sin depender de WhatsApp. Wompi no cobra mensualidad, solo una comisión por venta aprobada. Si llegas a ese punto, dímelo y te ayudo a reconectar la pasarela — el código ya quedó preparado para hacerlo sin rehacer nada.
