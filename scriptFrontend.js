// ===================================================================
//==========================IMPORTAR ARCHIVO DE PETICIONES================
import { fetchData } from "../peticionServer.js";
//================================================================
const HOST_API = "http://localhost:3000";
document.addEventListener("DOMContentLoaded", async () => {

  // ====================== PEDIR DATOS  ======================
  const pedirDatos = async (ccUser) => {
    try {
      return await fetchData(`${HOST_API}/data` , { ccUser: ccUser });
    } catch (error) {
      console.error("Error al obtener datos:", error);
      mostrarMensaje("Error al obtener datos del servidor");
      }
    }
  let dataJSON =  await pedirDatos(0); // ejemplo 
  console.log(dataJSON);
  

  // ====================== FUNCIONES AUXILIARES ======================
  function capturarItem(id) { return document.getElementById(id); }

  

  /// ===================== CAMBIAR ESTADO DEL BOT=========================
  async function changeStatusBot() {
    const divEstadoBot = capturarItem("estadoBot");
    let responseStatus = await fetchData(`${HOST_API}/statusbot`, { entity: "client" });
    if (responseStatus.statusBotServer) {
      divEstadoBot.textContent = "Conectado"
    } else {
      divEstadoBot.textContent = "Desconectado"
    }
    setTimeout(changeStatusBot, 10000); // cada 10 segundos
    const btnRebootBot = capturarItem("btnReiniciarBot");
      btnRebootBot.addEventListener("click", async () => {
        //let peticionReboot = await fetchData(`${HOST_API}/rebootbot`, { entity: "client" });
        
      });



  }




  // ====================== MODALES PERSONALIZADOS ======================
  // Crea y reutiliza dos modales: mensaje y confirm
  // - mostrarMensaje(text) -> muestra texto y cierra en 2.5s o con botón "Cerrar"
  // - mostrarConfirm(text, callback) -> muestra confirm con "Aceptar" / "Cancelar"

  function crearModalesSiNoExisten() {
    // Mensaje
    if (!document.getElementById('modalMensajeCustom')) {
      const htmlMsg = `
        <div class="modal" id="modalMensajeCustom" aria-hidden="true">
          <div class="modal-loading-content" style="min-width:260px; max-width:480px;">
            <p id="modalMensajeCustomTexto" style="white-space:pre-wrap; margin-bottom:12px;"></p>
            <div style="display:flex; justify-content:center;">
              <button id="modalMensajeCustomCerrar" class="btn-azul">Cerrar</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', htmlMsg);
      const cerrar = document.getElementById('modalMensajeCustomCerrar');
      cerrar.addEventListener('click', () => {
        const m = document.getElementById('modalMensajeCustom');
        if (m) m.style.display = 'none';
      });
    }

    // Confirm
    if (!document.getElementById('modalConfirmCustom')) {
      const htmlConfirm = `
        <div class="modal" id="modalConfirmCustom" aria-hidden="true">
          <div class="modal-loading-content" style="min-width:260px; max-width:480px;">
            <p id="modalConfirmCustomTexto" style="white-space:pre-wrap; margin-bottom:12px;"></p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button id="modalConfirmCustomAceptar" class="btn-azul">Aceptar</button>
              <button id="modalConfirmCustomCancelar" class="btn-rojo">Cancelar</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', htmlConfirm);
      // handlers se configuran en mostrarConfirm para que puedan recibir callback dinámico
    }
  }

  crearModalesSiNoExisten();

  // mostrar mensaje con autocierre
  let mensajeTimeoutId = null;
  function mostrarMensaje(texto) {
    crearModalesSiNoExisten();
    const modal = document.getElementById('modalMensajeCustom');
    const textoNode = document.getElementById('modalMensajeCustomTexto');
    if (!modal || !textoNode) return;
    textoNode.textContent = texto;
    modal.style.display = 'flex';

    // limpiar timeout previo si existiera
    if (mensajeTimeoutId) {
      clearTimeout(mensajeTimeoutId);
      mensajeTimeoutId = null;
    }

    // cerrar automáticamente en 2.5s
    mensajeTimeoutId = setTimeout(() => {
      modal.style.display = 'none';
      mensajeTimeoutId = null;
    }, 2500);
  }

  // mostrar confirm con callback (true/false)
  function mostrarConfirm(texto, callback) {
    crearModalesSiNoExisten();
    const modal = document.getElementById('modalConfirmCustom');
    const textoNode = document.getElementById('modalConfirmCustomTexto');
    const btnAceptar = document.getElementById('modalConfirmCustomAceptar');
    const btnCancelar = document.getElementById('modalConfirmCustomCancelar');
    if (!modal || !textoNode || !btnAceptar || !btnCancelar) {
      // fallback a confirm por si algo falla
      const r = window.confirm(texto);
      callback(Boolean(r));
      return;
    }

    textoNode.textContent = texto;
    modal.style.display = 'flex';

    // handlers temporales
    const onAceptar = () => {
      modal.style.display = 'none';
      cleanup();
      callback(true);
    };
    const onCancelar = () => {
      modal.style.display = 'none';
      cleanup();
      callback(false);
    };

    function cleanup() {
      btnAceptar.removeEventListener('click', onAceptar);
      btnCancelar.removeEventListener('click', onCancelar);
    }

    btnAceptar.addEventListener('click', onAceptar);
    btnCancelar.addEventListener('click', onCancelar);
  }

  // ====================== VALIDACIONES ======================
  function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function validarNumero(num) { return /^[0-9]+$/.test(num); }

  // ====================== RENDERIZAR TABLAS ======================
  function renderClientes() {
    const tbody = document.querySelector("#ContainerClientes tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    dataJSON.clientes.forEach(cliente => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cliente.cc}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.email}</td>
        <td>${cliente.direccion}</td>
        <td>${cliente.telefono}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="editarCliente('${cliente.cc}')">Editar</button>
          <button class="btn-rojo" onclick="eliminarCliente('${cliente.cc}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
  }

  function renderProductos() {
    const tbody = document.querySelector("#ContainerProductos tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    dataJSON.productos.forEach(prod => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${prod.codigo}</td>
        <td>${prod.nombre}</td>
        <td>${prod.descripcion}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="verProducto('${prod.codigo}')">Ver</button>
          <button class="btn-rojo" onclick="eliminarProducto('${prod.codigo}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
  }

  function renderFacturas() {
    const tbody = document.querySelector("#ContainerFacturas tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    dataJSON.facturas.forEach(fact => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${fact.codigo}</td>
        <td>${fact.cc}</td>
        <td>${fact.cliente}</td>
        <td>${fact.fecha}</td>
        <td class="options-table">
          <button class="btn-azul" onclick="verFactura('${fact.codigo}')">Ver</button>
          <button class="btn-rojo" onclick="eliminarFactura('${fact.codigo}')">Eliminar</button>
        </td>`;
      tbody.appendChild(fila);
    });
  }

  // ====================== CLIENTES ======================
  window.editarCliente = function (cc) {
    const cliente = dataJSON.clientes.find(c => c.cc === cc);
    if (!cliente) {
      mostrarMensaje("Cliente no encontrado");
      return;
    }

    // Rellenar formulario con los datos (IDs según HTML corregido)
    const el = capturarItem("modal1");
    if (!el) return;
    const ccInput = capturarItem("cc_cliente");
    const nombreInput = capturarItem("nombre_cliente");
    const emailInput = capturarItem("email_cliente");
    const direccionInput = capturarItem("direccion_cliente");
    const telefonoInput = capturarItem("telefono_cliente");

    if (ccInput) ccInput.value = cliente.cc;
    if (nombreInput) nombreInput.value = cliente.nombre;
    if (emailInput) emailInput.value = cliente.email;
    if (direccionInput) direccionInput.value = cliente.direccion;
    if (telefonoInput) telefonoInput.value = cliente.telefono;

    el.classList.add("active");
  };

  window.eliminarCliente = function (cc) {
    mostrarConfirm("¿Deseas eliminar este cliente? " + "\n se eliminaran las facturas asosiadas", (ok) => {
      if (ok) {
        dataJSON.clientes = dataJSON.clientes.filter(c => c.cc !== cc);
        dataJSON.facturas = dataJSON.facturas.filter(f => f.cc !== cc); // eliminar facturas asociadas
        renderClientes();
        renderFacturas();
        mostrarMensaje("Cliente eliminado correctamente");
        
      }
    });
  };

  // Guardar o editar cliente
  const btnAgregarCliente = capturarItem("btnAgregarCliente");
  if (btnAgregarCliente) {
    btnAgregarCliente.addEventListener("click", () => {
      const cc = (capturarItem("cc_cliente")?.value || "").trim();
      const nombre = (capturarItem("nombre_cliente")?.value || "").trim();
      const email = (capturarItem("email_cliente")?.value || "").trim();
      const direccion = (capturarItem("direccion_cliente")?.value || "").trim();
      const telefono = (capturarItem("telefono_cliente")?.value || "").trim();

      if (!cc || !nombre || !email || !direccion || !telefono) {
        mostrarMensaje("Por favor completa todos los campos");
        return;
      }
      if (!validarNumero(cc)) { mostrarMensaje("El CC debe ser numérico"); return; }
      if (!validarEmail(email)) { mostrarMensaje("El correo no es válido"); return; }

      const idx = dataJSON.clientes.findIndex(c => c.cc === cc);
      if (idx >= 0) {
        dataJSON.clientes[idx] = { cc, nombre, email, direccion, telefono };
        dataJSON.facturas.forEach(f => {
          if (f.cc === cc) f.cliente = nombre; // actualizar nombre en facturas asociadas
        });
        mostrarMensaje("Cliente actualizado correctamente");
        renderFacturas();
      } else {
        dataJSON.clientes.push({ cc, nombre, email, direccion, telefono });
        mostrarMensaje("Cliente agregado correctamente");
        renderFacturas();
      }

      renderClientes();
      const modal = capturarItem("modal1");
      if (modal) modal.classList.remove("active");
    });
  }

  // ====================== PRODUCTOS ======================
  window.verProducto = function (codigo) {
    const prod = dataJSON.productos.find(p => p.codigo === codigo);
    if (!prod) {
      mostrarMensaje("Producto no encontrado");
      return;
    }
    // mostramos como mensaje (se autocierrará)
    mostrarMensaje(`Código: ${prod.codigo}\nNombre: ${prod.nombre}\nDescripción: ${prod.descripcion}`);
  };

  window.eliminarProducto = function (codigo) {
    mostrarConfirm("¿Eliminar producto?", (ok) => {
      if (ok) {
        dataJSON.productos = dataJSON.productos.filter(p => p.codigo !== codigo);
        renderProductos();
        mostrarMensaje("Producto eliminado correctamente");
      }
    });
  };

  const btnAgregarProducto = capturarItem("btnAgregarProducto");
  if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener("click", () => {
      const codigo = (capturarItem("codigo_producto")?.value || "").trim();
      const nombre = (capturarItem("nombre_producto")?.value || "").trim();
      const descripcion = (capturarItem("descripcion_producto")?.value || "").trim();

      if (!codigo || !nombre || !descripcion) {
        mostrarMensaje("Completa todos los campos");
        return;
      }
      if (!validarNumero(codigo)) { mostrarMensaje("El código debe ser numérico"); return; }
      if (dataJSON.productos.some(p => p.codigo === codigo)) {
        mostrarMensaje("Ya existe un producto con ese código");
        return;
      }

      dataJSON.productos.push({ codigo, nombre, descripcion });
      renderProductos();
      mostrarMensaje("Producto agregado correctamente");
  console.log(dataJSON);
      // Limpiar formulario
      if (capturarItem("codigo_producto")) capturarItem("codigo_producto").value = "";
      if (capturarItem("nombre_producto")) capturarItem("nombre_producto").value = "";
      if (capturarItem("descripcion_producto")) capturarItem("descripcion_producto").value = "";

      const modal = capturarItem("modal3");
      if (modal) modal.classList.remove("active");
    });
  }

  // ====================== FACTURAS ======================
  window.verFactura = function (codigo) {
    const fact = dataJSON.facturas.find(f => f.codigo === codigo);
    if (!fact) {
      mostrarMensaje("Factura no encontrada");
      return;
    }

    const modal = capturarItem("modal2");
    if (!modal) return;
    const inCodigo = capturarItem("codigo_factura");
    const inCC = capturarItem("cc_factura");
    const inNombre = capturarItem("nombre_factura");
    const inFecha = capturarItem("fecha_factura");
    const inDescripcion = capturarItem("descripcion_factura");

    if (inCodigo) inCodigo.value = fact.codigo;
    if (inCC) inCC.value = fact.cc;
    if (inNombre) inNombre.value = fact.cliente;
    if (inFecha) inFecha.value = fact.fecha;
    //ciclo for paramostrar productos que compro
    //hay que iterar por que son varios productos de cada factura
    if (inDescripcion) {
      inDescripcion.value = "";
      for (const item of fact.descripcion) {
        inDescripcion.value += "Producto " + item.producto + "\n " +
          " Cantidad: " + item.cantidad + "\n " +
          " Precio: " + item.precio + "\n " +
          " Total: " + item.total + "\n\n";
      }
    }

    modal.classList.add("active");
  };

  window.eliminarFactura = function (codigo) {
    mostrarConfirm("¿Deseas eliminar la factura?", (ok) => {
      if (ok) {
        dataJSON.facturas = dataJSON.facturas.filter(f => f.codigo !== codigo);
        renderFacturas();
        mostrarMensaje("Factura eliminada correctamente");
      }
    });
  };

  // Enviar facturas (simulado). Buscamos varios posibles IDs por compatibilidad
  const btnEnviar = capturarItem("btnEnviarFacturas") || capturarItem("open-modal2");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      mostrarMensaje("Facturas enviadas correctamente (simulación)");
    });
  }

  // ====================== BUSCADORES ======================
  const btnBuscarCliente = capturarItem("btnBuscarCliente");
  if (btnBuscarCliente) {
    btnBuscarCliente.addEventListener("click", () => {
      const texto = (capturarItem("buscarCliente")?.value || "").trim().toLowerCase();
      const tbody = document.querySelector("#ContainerClientes tbody");
      if (!tbody) return;
      const filtrados = dataJSON.clientes.filter(c =>
        c.nombre.toLowerCase().includes(texto) || c.cc.includes(texto)
      );
      if (filtrados.length === 0) {
        mostrarMensaje("No se encontraron clientes");
        return;
      }else{
        tbody.innerHTML = "";
      filtrados.forEach(c => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${c.cc}</td>
          <td>${c.nombre}</td>
          <td>${c.email}</td>
          <td>${c.direccion}</td>
          <td>${c.telefono}</td>
          <td class="options-table">
            <button class="btn-azul" onclick="editarCliente('${c.cc}')">Editar</button>
            <button class="btn-rojo" onclick="eliminarCliente('${c.cc}')">Eliminar</button>
          </td>`;
        tbody.appendChild(fila);
      });

      }
      
    });
  }

  const btnBuscarProducto = capturarItem("btnBuscarProducto");
  if (btnBuscarProducto) {
    btnBuscarProducto.addEventListener("click", () => {
      const texto = (capturarItem("buscarProducto")?.value || "").trim().toLowerCase();
      const tbody = document.querySelector("#ContainerProductos tbody");
      if (!tbody) return;
      const filtrados = dataJSON.productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) || p.codigo.includes(texto)
      );
      if (filtrados.length === 0) {
        mostrarMensaje("No se encontraron productos");
        return;
      }else{
        tbody.innerHTML = "";
      filtrados.forEach(p => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${p.codigo}</td>
          <td>${p.nombre}</td>
          <td>${p.descripcion}</td>
          <td class="options-table">
            <button class="btn-azul" onclick="verProducto('${p.codigo}')">Ver</button>
            <button class="btn-rojo" onclick="eliminarProducto('${p.codigo}')">Eliminar</button>
          </td>`;
        tbody.appendChild(fila);
      });
      }
      
    });
  }

  const btnBuscarFactura = capturarItem("btnBuscarFactura");
  if (btnBuscarFactura) {
    btnBuscarFactura.addEventListener("click", () => {
      const texto = (capturarItem("buscarFactura")?.value || "").trim().toLowerCase();
      const tbody = document.querySelector("#ContainerFacturas tbody");
      if (!tbody) return;
      const filtrados = dataJSON.facturas.filter(f =>
        f.cliente.toLowerCase().includes(texto) || f.codigo.includes(texto)
      );
      if(filtrados.length === 0) {
        mostrarMensaje("No se encontraron facturas");
        return;
      }else{
        tbody.innerHTML = "";
      filtrados.forEach(f => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${f.codigo}</td>
          <td>${f.cc}</td>
          <td>${f.cliente}</td>
          <td>${f.fecha}</td>
          <td class="options-table">
            <button class="btn-azul" onclick="verFactura('${f.codigo}')">Ver</button>
            <button class="btn-rojo" onclick="eliminarFactura('${f.codigo}')">Eliminar</button>
          </td>`;
        tbody.appendChild(fila);
      });
      }
      
    });
  }

  // ====================== MENÚ NAVEGACIÓN ======================
  const ContainerClientes = capturarItem("ContainerClientes");
  const ContainerFacturas = capturarItem("ContainerFacturas");
  const ContainerProductos = capturarItem("ContainerProductos");
  const ContainerHome = capturarItem("ContainerHome");
  const ContainerLogin = capturarItem("ContainerLogin");
  const btnSalir = capturarItem("btnMenuSalir");
  if (btnSalir) {
    btnSalir.addEventListener("click", () => {
      const mainSections = document.querySelectorAll(".menu-section");
  // Ocultar todo el contenido al cargar, excepto login
    mostrarSeccion(ContainerLogin);
    mainSections.forEach(sec => sec.style.display = "none");
    });
  }

  function mostrarSeccion(seccion) {
    [ContainerClientes, ContainerFacturas, ContainerProductos, ContainerHome, ContainerLogin].forEach(s =>
      s && s.classList.add("content-section-disabled")
    );
    seccion && seccion.classList.remove("content-section-disabled");
  }

  capturarItem("btnMenuHome")?.addEventListener("click", () => mostrarSeccion(ContainerHome));
  capturarItem("btnMenuClientes")?.addEventListener("click", () => mostrarSeccion(ContainerClientes));
  capturarItem("btnMenuFacturas")?.addEventListener("click", () => mostrarSeccion(ContainerFacturas));
  capturarItem("btnMenuProductos")?.addEventListener("click", () => mostrarSeccion(ContainerProductos));

  // ====================== MODALES (abrir/cerrar botones de HTML) ======================
  // Solo enlazamos si existen los botones; si no, no hacemos nada.
  function conectarAbrirCerrar() {
    const open1 = capturarItem("open-modal1");
    if (open1) open1.addEventListener("click", () => capturarItem("modal1")?.classList.add("active"));
    const open2 = capturarItem("open-modal2");
    if (open2) open2.addEventListener("click", () => capturarItem("modal2")?.classList.add("active"));
    const open3 = capturarItem("open-modal3");
    if (open3) open3.addEventListener("click", () => capturarItem("modal3")?.classList.add("active"));

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close');
        if (target) capturarItem(target)?.classList.remove('active');
      });
    });
  }

  conectarAbrirCerrar();


  ///====================== 
  // ====================== LOGIN ======================
  const mainSections = document.querySelectorAll(".menu-section");

  // Ocultar todo el contenido al cargar, excepto login
  mostrarSeccion(ContainerLogin);
  mainSections.forEach(sec => sec.style.display = "none");

  const btnLogin = document.getElementById("btnLogin");
  const btnLimpiarLogin = document.getElementById("btnLimpiarLogin");

  btnLogin.addEventListener("click", async () => {
    capturarItem("spinnerContainerLogin").style.display = "block";
    btnLogin.style.display = "none";
    btnLimpiarLogin.style.display = "none";
    const user = document.getElementById("login_user").value.trim();
    const pass = document.getElementById("login_pass").value.trim();

    if (!user || !pass) {
      mostrarMensaje("Por favor complete todos los campos");
      return;
    }

    // Ejemplo: usuario y contraseña fijos
    if (user === "admin" && pass === "1234") {
      mostrarMensaje("Inicio de sesión exitoso");
      mostrarSeccion(ContainerHome);
      mainSections.forEach(sec => sec.style.display = "block");
      capturarItem("spinnerContainerLogin").style.display = "none";
    btnLogin.style.display = "block";
    btnLimpiarLogin.style.display = "block";
      dataJSON = await pedirDatos("123456789"); // recargar datos al iniciar sesión
      renderClientes();
      renderProductos();
      renderFacturas();
      changeStatusBot()

    } else {
      mostrarMensaje("Usuario o contraseña incorrectos");
    }
  });

  btnLimpiarLogin.addEventListener("click", () => {
    document.getElementById("login_user").value = "";
    document.getElementById("login_pass").value = "";
  });


  // ====================== INICIALIZACIÓN ======================
 
  mostrarSeccion(ContainerLogin);
  

  
}); // DOMContentLoaded end 