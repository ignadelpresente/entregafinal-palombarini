document.addEventListener("DOMContentLoaded", function () {
    const discosContainer = document.getElementById("productos");
    const carritoItemsContainer = document.getElementById("items");
    const totalContainer = document.getElementById("total");
    const mensajesBusquedaContainer = document.getElementById("mensajesBusqueda");
    const mensajeCompraContainer = document.getElementById("mensajeCompra");
    const busquedaInput = document.getElementById("busqueda");
    const buscarButton = document.getElementById("buscarButton");
    const comprarCarritoButton = document.getElementById("comprarCarrito");
    const vaciarCarritoButton = document.getElementById("vaciarCarrito");
  
  
    let discosDisponibles;
    let carrito;
  
    const cargarDiscos = async () => {
      try {
        const response = await fetch("../js/discos.json");
        const data = await response.json();
        discosDisponibles = data;
        mostrarDiscos();
      } catch (error) {
        console.error("Error al cargar los discos:", error);
      }
    };
  
  
    const cargarCarritoDesdeStorage = () => {
      carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      mostrarCarrito();
    };
  
    const guardarCarritoEnStorage = () => {
      localStorage.setItem("carrito", JSON.stringify(carrito));
    };
  
    const mostrarDiscos = () => {
      discosContainer.innerHTML = "";
  
      discosDisponibles.forEach((disco) => {
        if (disco.cantidad > 0) {
          const discoElement = document.createElement("div");
          discoElement.className = "producto";
          discoElement.innerHTML = `
            <img src="${disco.rutaImagen}" alt="${disco.nombreDisco}" class="imagen-disco">
            <p>${disco.nombreDisco}</p>
            <p>Precio: $${disco.precioDisco}</p>
            <p>Cantidad disponibles: ${disco.cantidad}</p>
            <button class="button" onclick="agregarAlCarrito('${disco.nombreDisco}')">Agregar al carrito</button>`;
          discosContainer.appendChild(discoElement);
        }
      });
    };
  
    const mostrarCarrito = () => {
      carritoItemsContainer.innerHTML = "";
      let total = 0;
  
      carrito.forEach((item) => {
        const { nombre, precio, cantidad } = item;
        const itemElement = document.createElement("div");
        itemElement.className = "item";
        itemElement.innerHTML = `
          <p>${nombre}</p>
          <p>Precio: $${precio}</p>
          <p>Cantidad: ${cantidad}</p>
          <button class="button" onclick="aumentarCantidad('${nombre}')">+</button>
          <button class="button" onclick="disminuirCantidad('${nombre}')">-</button>
          <button class="button" onclick="eliminarDelCarrito('${nombre}')">Eliminar</button>`;
        carritoItemsContainer.appendChild(itemElement);
        total += precio * cantidad;
      });
  
      totalContainer.textContent = `Total: $${total.toFixed(2)}`;
      guardarCarritoEnStorage();
    };
  
    const encontrarDiscoPorNombre = (nombre) => discosDisponibles.find(disco => disco.nombreDisco === nombre);
  
    const devolverAlStock = (nombre, cantidad) => {
      const disco = encontrarDiscoPorNombre(nombre);
      if (disco) disco.cantidad += cantidad;
    };
  
    window.agregarAlCarrito = (nombre) => {
      const disco = encontrarDiscoPorNombre(nombre);
      const carritoItem = carrito.find(item => item.nombre === nombre);
  
      if (disco && disco.cantidad > 0) {
        if (carritoItem) {
          carritoItem.cantidad++;
        } else {
          carrito.push({ nombre: disco.nombreDisco, precio: disco.precioDisco, cantidad: 1 });
        }
        disco.cantidad--;
        mostrarDiscos();
        mostrarCarrito();
      } else {
        mostrarMensajeNoStock();
      }
    };
  
  
    window.aumentarCantidad = (nombre) => {
      const { cantidad } = carrito.find(item => item.nombre === nombre) || {};
      const disco = encontrarDiscoPorNombre(nombre);
  
      if (cantidad && disco && disco.cantidad > 0) {
        carrito.find(item => item.nombre === nombre).cantidad++;
        disco.cantidad--;
        mostrarDiscos();
        mostrarCarrito();
      } else {
        mostrarMensajeNoStock();
      }
    };
  
    window.disminuirCantidad = (nombre) => {
      const carritoItem = carrito.find(item => item.nombre === nombre);
      const disco = encontrarDiscoPorNombre(nombre);
  
      if (carritoItem && disco) {
        if (carritoItem.cantidad > 1) {
          carritoItem.cantidad--;
          disco.cantidad++;
          mostrarDiscos();
          mostrarCarrito();
        } else {
          eliminarDelCarrito(nombre);
        }
      } else {
        mostrarMensajeNoStock();
      }
    };
  
    window.eliminarDelCarrito = (nombre) => {
      const index = carrito.findIndex(item => item.nombre === nombre);
      if (index !== -1) {
        const { cantidad } = carrito[index];
        carrito.splice(index, 1);
        devolverAlStock(nombre, cantidad);
        mostrarDiscos();
        mostrarCarrito();
      }
    };
  
    window.vaciarCarrito = () => {
      carrito.forEach(({ nombre, cantidad }) => devolverAlStock(nombre, cantidad));
      carrito.length = 0;
      mostrarDiscos();
      mostrarCarrito();
    };
  
  
  
    window.comprarDisco = (nombre) => {
      const disco = encontrarDiscoPorNombre(nombre);
  
      if (disco && disco.cantidad > 0) {
        carrito.push({ nombre: disco.nombreDisco, precio: disco.precioDisco, cantidad: 1 });
        disco.cantidad--;
        mostrarDiscos();
        mostrarCarrito();
        agregarMensajeCompra(`Ha comprado "${nombre}"`);
      } else if (disco && disco.cantidad === 0) {
        agregarMensajeCompra(`Lo sentimos, no hay stock disponible para "${nombre}".`);
      }
    };
  
    window.comprarCarrito = () => {
      if (carrito.length === 0) {
          Swal.fire({
              icon: 'warning',
              title: 'Carrito vacío',
              text: 'Agrega discos antes de realizar la compra.',
              confirmButtonText: 'Aceptar'
          });
      } else {
          const mensaje = document.createElement("div");
          mensaje.innerHTML = "<strong>Felicidades por tu compra:</strong>";
  
          carrito.forEach((item) => {
              const { nombre, precio, cantidad } = item;
              const infoDisco = document.createElement("div");
              infoDisco.innerHTML = `<p>Nombre: ${nombre}</p>
                                     <p>Precio: $${precio}</p>
                                     <p>Cantidad: ${cantidad}</p>
                                     <p>-------------------------------------</p>`;
  
              mensaje.appendChild(infoDisco);
  
              const disco = encontrarDiscoPorNombre(nombre);
              if (disco) disco.cantidad -= cantidad;
          });
  
          const totalElement = document.createElement("p");
          totalElement.textContent = `Precio total: $${totalContainer.textContent.split('$')[1]}`;
          mensaje.appendChild(totalElement);
  
          mensajeCompraContainer.innerHTML = "";
          mensajeCompraContainer.appendChild(mensaje);
  
          vaciarCarrito();
          mostrarDiscos();
  
          Swal.fire({
              icon: 'success',
              title: 'Compra realizada',
              html: mensaje.outerHTML,
              confirmButtonText: 'Aceptar'
          });
      }
  };
  
  
    window.buscarDisco = () => {
      const nombreBuscado = busquedaInput.value.trim().toLowerCase();
  
      if (nombreBuscado === "") {
        mensajesBusquedaContainer.textContent = "Ingresa el nombre del disco que desees buscar.";
        return;
      }
  
      const discoEncontrado = discosDisponibles.find(disco => disco.nombreDisco.toLowerCase() === nombreBuscado);
  
      if (discoEncontrado && discoEncontrado.cantidad > 0) {
        mensajesBusquedaContainer.textContent = `El disco "${discoEncontrado.nombreDisco}" está disponible.`;
  
        const mensajeAgregar = document.createElement("p");
        mensajeAgregar.textContent = `El disco "${discoEncontrado.nombreDisco}" está disponible por un precio de $${discoEncontrado.precioDisco}. ¿Queres agregarlo al carrito?`;
        mensajesBusquedaContainer.appendChild(mensajeAgregar);
  
        const botonSi = document.createElement("button");
        botonSi.className = "button";
        botonSi.textContent = "Si";
        botonSi.onclick = () => {
          agregarAlCarrito(discoEncontrado.nombreDisco);
          mensajesBusquedaContainer.textContent = `¡Agregaste "${discoEncontrado.nombreDisco}" al carrito!`;
        };
  
        mensajesBusquedaContainer.appendChild(botonSi);
  
        const botonNo = document.createElement("button");
        botonNo.className = "button";
        botonNo.textContent = "No";
        botonNo.onclick = () => {
          mensajesBusquedaContainer.textContent = `No has agregado "${discoEncontrado.nombreDisco}" al carrito.`;
        };
  
        mensajesBusquedaContainer.appendChild(botonNo);
      } else if (discoEncontrado && discoEncontrado.cantidad === 0) {
        mensajesBusquedaContainer.textContent = `Lo sentimos, no hay stock disponible para el disco "${nombreBuscado}".`;
  
        const botonVolver = document.createElement("button");
        botonVolver.className = "button";
        botonVolver.textContent = "Volver";
        botonVolver.onclick = () => {
          mensajesBusquedaContainer.textContent = "";
          busquedaInput.value = "";
        };
  
        mensajesBusquedaContainer.appendChild(botonVolver);
      } else {
        mensajesBusquedaContainer.textContent = `El disco "${nombreBuscado}" no está disponible.`;
  
        const botonVolver = document.createElement("button");
        botonVolver.className = "button";
        botonVolver.textContent = "Volver";
        botonVolver.onclick = () => {
          mensajesBusquedaContainer.textContent = "";
          busquedaInput.value = "";
        };
  
        mensajesBusquedaContainer.appendChild(botonVolver);
      }
    };
  
    const mostrarMensajeNoStock = () => {
      mensajesBusquedaContainer.textContent = "Lo sentimos, no hay más stock disponible.";
    };
  
    const agregarMensajeCompra = (mensaje) => {
      mensajeCompraContainer.textContent = mensaje;
    };
  
    const crearBotonBuscar = () => {
      const botonBuscar = document.createElement("button");
      botonBuscar.className = "button";
      botonBuscar.textContent = "Buscar otro disco";
      botonBuscar.onclick = () => {
        mensajesBusquedaContainer.textContent = "";
        busquedaInput.value = "";
      };
      return botonBuscar;
    };
  
    buscarButton.addEventListener("click", buscarDisco);
    comprarCarritoButton.addEventListener("click", comprarCarrito);
    vaciarCarritoButton.addEventListener("click", vaciarCarrito);
  
    cargarDiscos();
    cargarCarritoDesdeStorage();
  });
  
  
  