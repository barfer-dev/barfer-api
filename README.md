<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/barfer

# Server
NODE_ENV=development
PORT=3000
BACKEND_BASE_URL=http://localhost:3000
FRONTEND_BASE_URL=http://localhost:5173

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Cache
CACHE_TTL=3600

# Cookie
COOKIE_SECRET=your-cookie-secret

# Mercado Pago
MP_PUBLIC_KEY=your-mp-public-key
MP_ACCESS_TOKEN=your-mp-access-token
MP_BASE_URL=https://api.mercadopago.com
MP_PAYMENT_URL=https://www.mercadopago.com.ar/checkout/v1/payment

# Payway (Optional)
PAYWAY_SITE_ID=your-payway-site-id
PAYWAY_PUBLIC_API_KEY=your-payway-public-key
PAYWAY_PRIVATE_API_KEY=your-payway-private-key
PAYWAY_BASE_URL=https://developers.decidir.com

# Email
EMAIL_FROM=your-email@gmail.com
EMAIL_PASS=your-email-password

# Google OAuth
OAUTH_CLIENT_ID=your-google-client-id
OAUTH_CLIENT_SECRET=your-google-client-secret

# Google Sheets
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_PRIVATE_KEY=your-private-key
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SHEET_SAME_DAY_ID=your-same-day-sheet-id

# Google Maps API (for address verification)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Meta Conversions API
META_ACCESS_TOKEN=your-meta-access-token
```

### Google Maps API Setup

The application uses Google Maps Geocoding API to verify and validate addresses before saving them. To set this up:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**
4. Go to Credentials and create an API key
5. Restrict the API key (recommended):
   - Application restrictions: IP addresses (add your server IPs)
   - API restrictions: Restrict to Geocoding API only
6. Add the API key to your `.env` file as `GOOGLE_MAPS_API_KEY`

**Note:** Google provides $200 of free credit monthly (~40,000 geocoding requests). Monitor your usage in the Google Cloud Console.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Variantes Combinadas de Productos (Flavor y Weight)

### 📝 Explicación Simple

**¿Qué cambió?**

Agregamos dos campos nuevos a las opciones de productos: `flavor` (sabor) y `weight` (peso). Estos campos son **opcionales**, así que no rompe nada de lo que ya existe.

**¿Para qué sirve?**

Antes, para BIG DOG tenías que crear productos separados o usar el nombre de la opción para diferenciar (ej: "VACA" o "POLLO"). Ahora puedes crear opciones que combinen sabor Y peso al mismo tiempo.

**Ejemplo práctico:**

- **Antes**: Opciones con nombre "VACA" o "POLLO" (solo sabor)
- **Ahora**: Opciones con nombre "VACA - 5KG", "VACA - 10KG", "POLLO - 5KG", "POLLO - 10KG" (sabor + peso)

### 🎯 Lo que debe saber el Frontend (Resumen Simple)

**1. Los campos nuevos son opcionales**
- Si una opción no tiene `flavor` y `weight`, funciona igual que antes
- No necesitas cambiar nada en productos existentes

**2. Cómo detectar si un producto usa variantes combinadas**
- Si TODAS las opciones del producto tienen `flavor` y `weight` definidos → usa la nueva UI
- Si no → usa la UI normal de siempre (como está ahora)

**3. La nueva UI debe mostrar**
- Primero: botones para seleccionar sabor (VACA / POLLO)
- Después: botones para seleccionar peso (5KG / 10KG)
- Cuando ambos están seleccionados, mostrar la opción correspondiente con precio y stock

**4. El campo `name` sigue siendo importante**
- Es el texto que se muestra en el carrito y se guarda en las órdenes
- Ejemplo: "VACA - 5KG" se muestra tal cual al usuario

**5. Los campos `flavor` y `weight` son solo para la lógica**
- Se usan para agrupar y filtrar opciones en el frontend
- El `name` es lo que realmente se muestra al usuario final

### Descripción Técnica

Se implementó un sistema de variantes combinadas para productos que permite combinar múltiples atributos (como sabor y peso) en las opciones de un producto. Esto es especialmente útil para productos como BIG DOG que se venden por sabor (VACA/POLLO) y por peso (5KG/10KG).

### Cambios en el Backend

Se agregaron dos campos opcionales a las opciones de productos:

- `flavor?: string` - Para identificar el sabor (ej: "VACA", "POLLO")
- `weight?: string` - Para identificar el peso (ej: "5KG", "10KG")

Estos campos son **opcionales** y **retrocompatibles**, por lo que no afectan a los productos existentes.

#### Archivos Modificados

1. **Schema**: `src/schemas/option.schema.ts`
   - Agregados campos `flavor` y `weight` como opcionales

2. **DTOs**:
   - `src/modules/products/dto/option.dto.ts`
   - `src/modules/options/dto/option.dto.ts`
   - `src/modules/options/dto/option-response.dto.ts`

### Estructura de Datos

#### Opción con Variantes Combinadas

```typescript
{
  _id: "677be1080ad7b1e3ece25e34",
  name: "VACA - 5KG",        // Texto completo para mostrar
  description: "15 unidades de 1kg c/u",
  price: 15000,
  stock: 10,
  flavor: "VACA",            // Para agrupar/filtrar en frontend
  weight: "5KG",             // Para agrupar/filtrar en frontend
  productId: "677be1070ad7b1e3ece25e2d"
}
```

#### Opción Normal (sin variantes combinadas)

```typescript
{
  _id: "66cf6c26a2cc94fdeb2ad0cb",
  name: "5KG",               // Solo peso, como antes
  description: "25 medallones de 200grs",
  price: 40000,
  stock: 7082,
  // flavor y weight no están definidos
  productId: "66cf6c25a2cc94fdeb2ad0c6"
}
```

### Uso en el Frontend

#### 1. Detectar Productos con Variantes Combinadas

Un producto tiene variantes combinadas si **todas** sus opciones tienen `flavor` y `weight` definidos:

```typescript
function hasCombinedVariants(product: Product): boolean {
  if (!product.options || product.options.length === 0) return false;
  
  return product.options.every(option => 
    option.flavor && option.weight
  );
}
```

#### 2. Extraer Valores Únicos

```typescript
// Obtener sabores únicos
const flavors = [...new Set(
  product.options
    .map(opt => opt.flavor)
    .filter(Boolean)
)];

// Obtener pesos únicos
const weights = [...new Set(
  product.options
    .map(opt => opt.weight)
    .filter(Boolean)
)];
```

#### 3. Filtrar Opciones Disponibles

```typescript
// Filtrar opciones por sabor seleccionado
const optionsByFlavor = product.options.filter(
  opt => opt.flavor === selectedFlavor
);

// Filtrar opciones por peso disponible para un sabor
const availableWeights = selectedFlavor
  ? [...new Set(
      product.options
        .filter(opt => opt.flavor === selectedFlavor)
        .map(opt => opt.weight)
    )]
  : weights;

// Encontrar opción seleccionada
const selectedOption = product.options.find(opt => 
  opt.flavor === selectedFlavor && 
  opt.weight === selectedWeight
);
```

#### 4. Ejemplo de Componente React

```typescript
function ProductVariantSelector({ product, onOptionSelect }) {
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  
  const hasCombinedVariants = product.options?.every(
    opt => opt.flavor && opt.weight
  );
  
  if (!hasCombinedVariants) {
    // UI normal - mostrar todas las opciones
    return (
      <div>
        {product.options.map(option => (
          <button 
            key={option._id} 
            onClick={() => onOptionSelect(option)}
          >
            {option.name} - ${option.price}
          </button>
        ))}
      </div>
    );
  }
  
  // UI con selección de sabor y peso
  const flavors = [...new Set(product.options.map(opt => opt.flavor))];
  const weights = [...new Set(product.options.map(opt => opt.weight))];
  
  const availableWeights = selectedFlavor 
    ? [...new Set(
        product.options
          .filter(opt => opt.flavor === selectedFlavor)
          .map(opt => opt.weight)
      )]
    : weights;
  
  const selectedOption = selectedFlavor && selectedWeight
    ? product.options.find(opt => 
        opt.flavor === selectedFlavor && opt.weight === selectedWeight
      )
    : null;
  
  return (
    <div>
      {/* Selector de Sabor */}
      <div>
        <h3>Selecciona sabor:</h3>
        {flavors.map(flavor => (
          <button 
            key={flavor}
            onClick={() => {
              setSelectedFlavor(flavor);
              setSelectedWeight(null); // Reset peso al cambiar sabor
            }}
            className={selectedFlavor === flavor ? 'selected' : ''}
          >
            {flavor}
          </button>
        ))}
      </div>
      
      {/* Selector de Peso (solo si hay sabor seleccionado) */}
      {selectedFlavor && (
        <div>
          <h3>Selecciona peso:</h3>
          {availableWeights.map(weight => (
            <button 
              key={weight}
              onClick={() => {
                setSelectedWeight(weight);
                if (selectedOption) {
                  onOptionSelect(selectedOption);
                }
              }}
              className={selectedWeight === weight ? 'selected' : ''}
            >
              {weight}
            </button>
          ))}
        </div>
      )}
      
      {/* Información de la opción seleccionada */}
      {selectedOption && (
        <div>
          <p>Precio: ${selectedOption.price}</p>
          <p>Stock: {selectedOption.stock}</p>
          <p>Descripción: {selectedOption.description}</p>
        </div>
      )}
    </div>
  );
}
```

### Crear Opciones con Variantes Combinadas

Para crear opciones con variantes combinadas (ej: BIG DOG), envía en el request:

```json
{
  "name": "VACA - 5KG",
  "description": "15 unidades de 1kg c/u",
  "price": 15000,
  "stock": 10,
  "flavor": "VACA",
  "weight": "5KG",
  "productId": "677be1070ad7b1e3ece25e2d"
}
```

**Ejemplo completo para BIG DOG con 4 opciones:**

1. **VACA - 5KG**: `{ name: "VACA - 5KG", flavor: "VACA", weight: "5KG", ... }`
2. **VACA - 10KG**: `{ name: "VACA - 10KG", flavor: "VACA", weight: "10KG", ... }`
3. **POLLO - 5KG**: `{ name: "POLLO - 5KG", flavor: "POLLO", weight: "5KG", ... }`
4. **POLLO - 10KG**: `{ name: "POLLO - 10KG", flavor: "POLLO", weight: "10KG", ... }`

### Notas Importantes

1. **Retrocompatibilidad**: Los productos existentes sin `flavor` y `weight` siguen funcionando normalmente.

2. **Campo `name`**: Siempre debe contener el texto completo que se mostrará al usuario (ej: "VACA - 5KG"). Este es el texto que se guarda en las órdenes.

3. **Campos `flavor` y `weight`**: Son solo para la lógica del frontend (agrupar, filtrar, mostrar selectores).

4. **Validación**: Si un producto tiene variantes combinadas, **todas** sus opciones deben tener ambos campos definidos.

### Endpoints Afectados

Todos los endpoints que devuelven opciones ahora incluyen los campos `flavor` y `weight` (si están definidos):

- `GET /products` - Lista de productos con opciones
- `GET /products/:id` - Producto específico con opciones
- `GET /products/category/:id` - Productos por categoría
- `POST /options` - Crear opción (acepta `flavor` y `weight`)
- `PUT /options/:id` - Actualizar opción (acepta `flavor` y `weight`)

## License

Nest is [MIT licensed](LICENSE).
