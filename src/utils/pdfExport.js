import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportSchedulesToPDF = (schedules, title = 'Reporte de Horarios', filters = {}) => {
  const doc = new jsPDF();
  
  // Configuración de fuentes
  doc.setFont('helvetica');
  
  // Título
  doc.setFontSize(18);
  doc.text(title, 14, 15);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 25);
  
  // Filtros aplicados
  let yPos = 35;
  if (Object.keys(filters).length > 0) {
    doc.setFontSize(12);
    doc.text('Filtros aplicados:', 14, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    if (filters.id_empleado) {
      doc.text(`Empleado ID: ${filters.id_empleado}`, 20, yPos);
      yPos += 5;
    }
    if (filters.fecha_inicio) {
      doc.text(`Desde: ${filters.fecha_inicio}`, 20, yPos);
      yPos += 5;
    }
    if (filters.fecha_fin) {
      doc.text(`Hasta: ${filters.fecha_fin}`, 20, yPos);
      yPos += 5;
    }
    yPos += 5;
  }
  
  // Preparar datos para la tabla
  const tableData = schedules.map(schedule => {
    const empleado = schedule.empleado?.usuario?.nombre || 'N/A';
    const correo = schedule.empleado?.usuario?.correo || 'N/A';
    
    return [
      schedule.id || 'N/A',
      empleado,
      correo,
      schedule.fecha || 'N/A',
      `${schedule.hora_inicio || 'N/A'} - ${schedule.hora_fin || 'N/A'}`,
      schedule.estado || 'N/A'
    ];
  });
  
  // Configurar tabla
  const tableColumns = [
    'ID',
    'Empleado',
    'Correo',
    'Fecha',
    'Horario',
    'Estado'
  ];
  
  // Generar tabla
  doc.autoTable({
    head: [tableColumns],
    body: tableData,
    startY: yPos,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: yPos }
  });
  
  // Resumen
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total de registros: ${schedules.length}`, 14, finalY);
  
  // Guardar PDF
  const fileName = `horarios_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

export const exportEmployeeSchedulesToPDF = (employee, schedules, filters = {}) => {
  const title = `Horarios - ${employee.usuario?.nombre || 'Empleado'}`;
  return exportSchedulesToPDF(schedules, title, filters);
};
