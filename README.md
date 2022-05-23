# PRUEBA TECNICA BRM - API

API acerca de tienda electrónica donde existen dos roles (cliente y administrador). Aqui podrás registar tus datos (también modificarlos) e iniciar sesion.

EL ADMINISTRADOR:

El administrador podrá crear, leer, actualizar y eliminar los productos del inventario, cada producto tiene las siguientes especificaciones:

<ul>
  <li>Numero de lote</li>
  <li>Nombre</li>
  <li>Precio</li>
  <li>Cantidad disponible</li>
  <li>Fecha de ingreso</li>
</ul>

El administrador también podrá visualizar las compras realizadas por todos los usuarios; allí podrá ver el cliente, la fecha, los productos (con sus cantidades) y el valor total de la compra.

EL CLIENTE:

El cliente podrá agregar, modificar y eliminar productos con sus diferentes cantidades al carro de compras; proceder a comprar el producto y visualizar el historial de todas las ordenes realizadas con anterioridad.

## Doc

Documentación con Postman:

https://documenter.getpostman.com/view/18428706/UyxojQWQ

Documentación con Apidoc:

Es necesario inicializar el proyecto localmente con el comando npm run start:dev y vizualizarlo a traves de live server (Importante usarlo en el html del proyecto)

Si se realiza alguna modificación en la documentación, ejecuta el script: "npm run docs" y se realizará su respectiva actualización

## Deploy

https://prueba-tecnica-brm.herokuapp.com/

## Inicia el proyecto

Si desea ver el proyecto localmente, debe instalar las dependencias para ver correctamente la API.

## Instación e inicio

### `npm install`

En el directorio del proyecto, debe usar npm i y esperar la instalación:

<ul>
  <li>apidoc</li>
  <li>bcryptjs</li>
  <li>compression</li>
  <li>cors</li>
  <li>dotenv</li>
  <li>express</li>
  <li>express-rate-limit</li>
  <li>express-validator</li>
  <li>helmet</li>
  <li>jsonwebtoken</li>
  <li>pg</li>
  <li>pg-hstore</li>
  <li>sequelize</li>
</ul>

Si tienes alguna sugerencia o comentario escribeme a mi correo o a mi perfil de linkedin y con gusto lo tomare en cuenta!!

LinkedIn: https://www.linkedin.com/in/nicolasggdev/

E-mail: nicolasggdev@gmail.com
