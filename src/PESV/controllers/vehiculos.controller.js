import {
  findAllVehiculos,
  findSelectInformationVehiculos,
  updateVehicule,
  toggleVehiculoEnUso,
  obtenerVehiculosSinPreoperacional,
} from "../services/vehicule.service.js";
import { getDocuemntsByIdVehiculo } from "../services/documents.service.js";
import ExcelJS from 'exceljs';

export const getAllVehiculos = async (req, res) => {
  try {
    const response = await findAllVehiculos();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong in getAllVehiculos",
      error,
    });
  }
};

export const exportExcelVehiculos = async (req, res) => {
  try {
    let vehiculos = await findAllVehiculos();

    vehiculos = vehiculos.data || [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Vehículos", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Encabezados con estilo
    worksheet.columns = [
      { header: "Placa", key: "placa" },
      { header: "Marca", key: "marca" },
      { header: "Modelo", key: "modeloVehiculo" },
      { header: "Año", key: "anio" },
      { header: "Color", key: "color" },
      { header: "Clase Unidad", key: "claseUnidad" },
      { header: "Clase Vehículo", key: "claseVehiculo" },
      { header: "Actividad", key: "actividadVehiculo" },
      { header: "Zona", key: "zona" },
      { header: "Capacidad", key: "capacidadVehiculo" },
      { header: "Servicio", key: "servicio" },
      { header: "Empresa", key: "VehicleEmpresa" },
      { header: "En Uso", key: "vehiculoEnUso" },
      { header: "Estado", key: "estadoVehiculo" },
      { header: "Fecha Matrícula", key: "fechaMatricula" },
      { header: "Creado por", key: "usuarioCreador" },
    ];

    // Rellenar filas
    vehiculos.forEach(v => {
      worksheet.addRow({
        placa: v.placa,
        marca: v.marca,
        modeloVehiculo: v.modeloVehiculo,
        anio: v.fechaMatricula instanceof Date ? v.fechaMatricula.getFullYear() : "",
        color: v.color,
        claseUnidad: v.claseUnidad,
        claseVehiculo: v.idClaseVehiculo?.name || "—",
        actividadVehiculo: v.idActividadVehiculo?.nombreTipo || "—",
        zona: v.idZona?.nombreZona || "—",
        capacidadVehiculo: v.capacidadVehiculo,
        servicio: v.servicio,
        VehicleEmpresa: v.VehicleEmpresa ? "Sí" : "No",
        vehiculoEnUso: v.vehiculoEnUso ? "Sí" : "No",
        estadoVehiculo: v.estadoVehiculo ? "Activo" : "Inactivo",
        fechaMatricula: v.fechaMatricula
          ? new Date(v.fechaMatricula).toLocaleDateString("es-CO")
          : "—",
        usuarioCreador: v.idUsuario
          ? `${v.idUsuario.name} ${v.idUsuario.lastName}`
          : "—",
      });
    });

    // Estilo de encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2F855A" }, // verde oscuro
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Autoajustar ancho de columnas
    worksheet.columns.forEach((column) => {
      let maxLength = 15;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength + 2;
    });

    // Aplicar autofiltros
    worksheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },
      to: {
        row: 1,
        column: worksheet.columns.length,
      },
    };

    // Enviar al navegador como archivo descargable
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=vehiculos.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Error al exportar vehículos:", error);
    res.status(500).json({
      message: "Error al generar el archivo Excel",
      error: error.message || error,
    });
  }
};

export const getAllSelectVehicules = async (req, res) => {
  try {
    const response = await findSelectInformationVehiculos();
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong in getAllSelectVehicules",
      error,
    });
  }
};

export const getDocsByIdVehiculo = async (req, res) => {
  try {
    const id_vehiculo = req.params.id;
    const response = await getDocuemntsByIdVehiculo(id_vehiculo);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong in getAllSelectVehicules",
      error,
    });
  }
};

export const editVehicule = async (req, res) => {
  const { body, params } = req;
  try {
    const response = await updateVehicule(params.id, body);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(400).json({
      message: "Something went wrong in editVehicule",
      error,
    });
  }
};

export const changeEstadoUso = async (req, res) => {
  const { params } = req;
  try {
    const response = await toggleVehiculoEnUso(params.id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(400).json({
      message: "Something went wrong in editVehicule",
      error,
    });
  }
};

export const getVehiculosSinFormularioPreOperacionalDiario = async (
  req,
  res
) => {
  const response = await obtenerVehiculosSinPreoperacional(req.user.userId);
  res.status(200).json(response);
  try {
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(400).json({
      message: "Something went wrong in editVehicule",
      error,
    });
  }
};




