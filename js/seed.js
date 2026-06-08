(() => {
  'use strict';

  const SEED_FLAG = 'farmabogota.seeded.v1';

  if (localStorage.getItem(SEED_FLAG)) return;

  // Centroides calculados del GeoJSON oficial de Bogotá
  const C = {
    'Usaquén': [4.72033, -74.01426],
    'Suba': [4.77307, -74.08913],
    'Engativá': [4.71606, -74.11150],
    'Barrios Unidos': [4.66821, -74.07663],
    'Chapinero': [4.63763, -74.02210],
    'Fontibón': [4.67253, -74.15239],
    'Teusaquillo': [4.64443, -74.08396],
    'Santa Fe': [4.59490, -74.03768],
    'Los Mártires': [4.60854, -74.08011],
    'La Candelaria': [4.59755, -74.07081],
    'Antonio Nariño': [4.59218, -74.11336],
    'Puente Aranda': [4.60974, -74.11804],
    'San Cristóbal': [4.54956, -74.06992],
    'Rafael Uribe Uribe': [4.56004, -74.10733],
    'Tunjuelito': [4.57303, -74.14209],
    'Usme': [4.45667, -74.12642],
    'Kennedy': [4.62815, -74.16113],
    'Bosa': [4.61840, -74.18969],
    'Ciudad Bolívar': [4.47025, -74.14508],
    'Sumapaz': [4.01515, -74.26902],
  };

  // Desplazamientos para distribuir 8 farmacias dentro de cada localidad
  const offsets = [
    [-0.008, -0.006], [0.007, -0.010], [-0.005, 0.009],
    [0.009, 0.007],  [-0.012, 0.004], [0.011, -0.005],
    [-0.009, -0.011], [0.004, 0.012],
  ];

  const farmacias = [
    // --- Usaquén ---
    { nombre: 'Farmacia Santa Bibiana', direccion: 'Carrera 7 # 120-30', anios: 15, proposito: 'Atención farmacéutica integral y dispensación de medicamentos de alta complejidad', localidad: 'Usaquén' },
    { nombre: 'Droguería Parque Cedro', direccion: 'Calle 127A # 8B-45', anios: 8, proposito: 'Servicio 24 horas y entrega a domicilio en la zona norte', localidad: 'Usaquén' },
    { nombre: 'Farmashopping Usaquén', direccion: 'Carrera 9 # 118-72', anios: 22, proposito: 'Farmacia comunitaria con programas de cuidado preventivo', localidad: 'Usaquén' },
    { nombre: 'Salud Contigo San Cristóbal Norte', direccion: 'Avenida 19 # 125-10', anios: 5, proposito: 'Especializada en medicamentos biológicos y de alto costo', localidad: 'Usaquén' },
    { nombre: 'DrogrExpress Santa Paula', direccion: 'Calle 134 # 9-50', anios: 3, proposito: 'Dispensación rápida y servicio de fórmula médica por WhatsApp', localidad: 'Usaquén' },
    { nombre: 'Farmacia La Colina', direccion: 'Carrera 11 # 116-08', anios: 18, proposito: 'Atención personalizada a adultos mayores y pacientes crónicos', localidad: 'Usaquén' },
    { nombre: 'Bienestar Farma Country', direccion: 'Avenida 7 # 123-15', anios: 11, proposito: 'Venta de productos naturales y fitoterapéuticos con asesoría profesional', localidad: 'Usaquén' },
    { nombre: 'Droguería Verona', direccion: 'Calle 120 # 7-34', anios: 7, proposito: 'Laboratorio de fórmulas magistrales y preparaciones dermatológicas', localidad: 'Usaquén' },

    // --- Suba ---
    { nombre: 'Farmacia Suba Centro', direccion: 'Carrera 91 # 145-20', anios: 12, proposito: 'Farmacia de referencia en la localidad con servicio de inyectología', localidad: 'Suba' },
    { nombre: 'Droguería Rincón del Valle', direccion: 'Calle 146 # 93-50', anios: 6, proposito: 'Atención a familias y dispensación de medicamentos pediátricos', localidad: 'Suba' },
    { nombre: 'Farmavida Niza', direccion: 'Avenida 127 # 58-30', anios: 20, proposito: 'Programa de fidelización con descuentos en medicamentos de control', localidad: 'Suba' },
    { nombre: 'Salud Tuya Bilbao', direccion: 'Carrera 60 # 145-70', anios: 4, proposito: 'Especializada en salud deportiva y suplementos nutricionales', localidad: 'Suba' },
    { nombre: 'DrogExpress El Pinar', direccion: 'Calle 138 # 72-44', anios: 9, proposito: 'Servicio de entrega gratuita en toda la localidad de Suba', localidad: 'Suba' },
    { nombre: 'Farmacia La Alhambra', direccion: 'Transversal 73 # 142-12', anios: 16, proposito: 'Farmacia con énfasis en salud mental y medicamentos neurológicos', localidad: 'Suba' },
    { nombre: 'Farmamás Suba', direccion: 'Avenida 132 # 85-20', anios: 2, proposito: 'Atención rápida y convenio con principales EPS de la región', localidad: 'Suba' },
    { nombre: 'Droguería Mi Casa', direccion: 'Carrera 76 # 148-15', anios: 10, proposito: 'Farmacia de barrio con servicio de toma de presión y glucosa', localidad: 'Suba' },

    // --- Engativá ---
    { nombre: 'Farmacia Engativá Central', direccion: 'Calle 80 # 70A-24', anios: 25, proposito: 'Referente histórico en la localidad con dispensación de todas las EPS', localidad: 'Engativá' },
    { nombre: 'Droguería Villa Amalia', direccion: 'Transversal 76 # 77-40', anios: 14, proposito: 'Atención especializada en salud respiratoria y medicamentos para asma', localidad: 'Engativá' },
    { nombre: 'Farmasalud Bolivia', direccion: 'Carrera 69 # 78-15', anios: 7, proposito: 'Programa de cuidado del adulto mayor con entrega a domicilio', localidad: 'Engativá' },
    { nombre: 'Droguería El Dorado', direccion: 'Avenida El Dorado # 76-08', anios: 30, proposito: 'Farmacia de alta rotación con los mejores precios de la zona', localidad: 'Engativá' },
    { nombre: 'Salud Farma Aeropuerto', direccion: 'Calle 81 # 68-52', anios: 5, proposito: 'Farmacia de viajeros con venta de medicamentos de emergencia', localidad: 'Engativá' },
    { nombre: 'Farmacia San José Obrero', direccion: 'Carrera 73 # 75-30', anios: 19, proposito: 'Atención comunitaria con talleres de uso racional de medicamentos', localidad: 'Engativá' },
    { nombre: 'Bienestar Engativá', direccion: 'Calle 79 # 71-27', anios: 11, proposito: 'Servicio de nutrición y venta de vitaminas y suplementos', localidad: 'Engativá' },
    { nombre: 'DrogrExpress Álamos', direccion: 'Transversal 72 # 82-30', anios: 4, proposito: 'Farmacia 24 horas con drive-thru y atención virtual', localidad: 'Engativá' },

    // --- Barrios Unidos ---
    { nombre: 'Farmacia 7 de Agosto', direccion: 'Calle 66 # 30-25', anios: 35, proposito: 'Farmacia tradicional del barrio 7 de Agosto con despacho a domicilio', localidad: 'Barrios Unidos' },
    { nombre: 'Droguería La Merced', direccion: 'Carrera 24 # 63-08', anios: 9, proposito: 'Especialistas en medicamentos dermatológicos y dermocosmética', localidad: 'Barrios Unidos' },
    { nombre: 'Farmasana Simón Bolívar', direccion: 'Avenida 68 # 53-40', anios: 13, proposito: 'Farmacia de referencia cerca al parque con servicio de vacunación', localidad: 'Barrios Unidos' },
    { nombre: 'Salud Activa Sede Norte', direccion: 'Calle 64 # 28-15', anios: 7, proposito: 'Atención farmacéutica con énfasis en medicina preventiva', localidad: 'Barrios Unidos' },
    { nombre: 'DrogExpress 66', direccion: 'Carrera 29 # 65-70', anios: 3, proposito: 'Dispensación express con envío en menos de 30 minutos', localidad: 'Barrios Unidos' },
    { nombre: 'Farmacia Los Parques', direccion: 'Calle 68 # 26-50', anios: 17, proposito: 'Programa de cuidado pediátrico y medicamentos infantiles', localidad: 'Barrios Unidos' },
    { nombre: 'Droguería Unión', direccion: 'Transversal 27 # 62-33', anios: 21, proposito: 'Amplio stock de medicamentos genéricos a precios competitivos', localidad: 'Barrios Unidos' },
    { nombre: 'Farmavida Doce de Octubre', direccion: 'Carrera 23 # 67-18', anios: 6, proposito: 'Farmacia comunitaria con servicios de promoción de salud', localidad: 'Barrios Unidos' },

    // --- Chapinero ---
    { nombre: 'Farmacia Chapinero Clásica', direccion: 'Carrera 13 # 58-20', anios: 40, proposito: 'Farmacia histórica de Chapinero con atención personalizada', localidad: 'Chapinero' },
    { nombre: 'Droguería Lourdes', direccion: 'Calle 63 # 11-52', anios: 18, proposito: 'Especializada en salud estética y medicamentos de uso cosmético', localidad: 'Chapinero' },
    { nombre: 'Farmabienestar Porciúncula', direccion: 'Carrera 9 # 56-34', anios: 11, proposito: 'Farmacia con énfasis en medicina alternativa y homeopatía', localidad: 'Chapinero' },
    { nombre: 'Salud Premium Chapinero', direccion: 'Avenida 13 # 54-70', anios: 8, proposito: 'Farmacia de alta gama con medicamentos importados y especializados', localidad: 'Chapinero' },
    { nombre: 'Droguería El Nogal', direccion: 'Calle 70 # 8-42', anios: 23, proposito: 'Referente en medicamentos oncológicos y de cuidado paliativo', localidad: 'Chapinero' },
    { nombre: 'FarmaVida Sana', direccion: 'Carrera 11 # 61-28', anios: 5, proposito: 'Servicio de entrega 24/7 con chat farmacéutico en línea', localidad: 'Chapinero' },
    { nombre: 'Bienestar Integral', direccion: 'Calle 59 # 12-15', anios: 14, proposito: 'Farmacia con servicios de bienestar y salud mental integral', localidad: 'Chapinero' },
    { nombre: 'Droguería Rosales', direccion: 'Avenida 7 # 52-81', anios: 29, proposito: 'Atención de excelencia con preparaciones magistrales y compuestos', localidad: 'Chapinero' },

    // --- Fontibón ---
    { nombre: 'Farmacia Fontibón Real', direccion: 'Calle 17 # 100-30', anios: 16, proposito: 'Farmacia central de Fontibón con servicio de ambulancia', localidad: 'Fontibón' },
    { nombre: 'Droguería Aeropuerto', direccion: 'Avenida Centenario # 102-15', anios: 10, proposito: 'Medicamentos para viajeros y kits de emergencia certificados', localidad: 'Fontibón' },
    { nombre: 'Farmavida Zona Franca', direccion: 'Carrera 102 # 18-65', anios: 7, proposito: 'Farmacia industrial con servicios para empresas de la zona franca', localidad: 'Fontibón' },
    { nombre: 'Salud Fontibón Park', direccion: 'Calle 19 # 98-44', anios: 4, proposito: 'Farmacia de barrio con servicio de fisioterapia básica', localidad: 'Fontibón' },
    { nombre: 'DrogExpress Fontibón', direccion: 'Transversal 96 # 16-20', anios: 6, proposito: 'Despacho inmediato y servicio de fórmula exprés en 15 minutos', localidad: 'Fontibón' },
    { nombre: 'Farmacia San Pablo Fontibón', direccion: 'Carrera 105 # 15-50', anios: 20, proposito: 'Tradición farmacéutica con atención a pacientes crónicos', localidad: 'Fontibón' },
    { nombre: 'Droguería La Felicidad', direccion: 'Calle 22 # 93-12', anios: 12, proposito: 'Medicamentos veterinarios y farmacia para mascotas', localidad: 'Fontibón' },
    { nombre: 'FarmaTotal Fontibón', direccion: 'Avenida 100 # 20-58', anios: 3, proposito: 'Farmacia con app móvil y domicilios sin costo adicional', localidad: 'Fontibón' },

    // --- Teusaquillo ---
    { nombre: 'Farmacia Teusaquillo Park', direccion: 'Carrera 24 # 44-10', anios: 28, proposito: 'Farmacia de referencia cerca al Parque Metropolitano', localidad: 'Teusaquillo' },
    { nombre: 'Droguería Galerías', direccion: 'Calle 51 # 26-80', anios: 15, proposito: 'Atención especializada en medicamentos para trasplantes y VIH', localidad: 'Teusaquillo' },
    { nombre: 'Farmavida Palermo', direccion: 'Carrera 17 # 40-25', anios: 9, proposito: 'Farmacia de barrio con servicio de enfermería a domicilio', localidad: 'Teusaquillo' },
    { nombre: 'Salud Arcos', direccion: 'Avenida 30 # 49-50', anios: 22, proposito: 'Farmacia universitaria con descuentos para estudiantes', localidad: 'Teusaquillo' },
    { nombre: 'Droguería El Campín', direccion: 'Calle 48 # 28-33', anios: 31, proposito: 'Farmacia histórica con servicio de ortopedia y ayudas técnicas', localidad: 'Teusaquillo' },
    { nombre: 'FarmaTotal Polo', direccion: 'Carrera 20 # 46-18', anios: 6, proposito: 'Farmacia digital con consulta virtual y envío nacional', localidad: 'Teusaquillo' },
    { nombre: 'Bienestar Quinta Paredes', direccion: 'Transversal 26 # 42-15', anios: 13, proposito: 'Especialistas en medicina deportiva y recovery muscular', localidad: 'Teusaquillo' },
    { nombre: 'Farmasana Teusaquillo', direccion: 'Calle 45 # 23-70', anios: 5, proposito: 'Farmacia ecológica con productos libres de plástico', localidad: 'Teusaquillo' },

    // --- Santa Fe ---
    { nombre: 'Farmacia Santa Fe Central', direccion: 'Carrera 7 # 23-40', anios: 45, proposito: 'Farmacia más antigua de la zona con dispensación histórica', localidad: 'Santa Fe' },
    { nombre: 'Droguería Las Nieves', direccion: 'Calle 26 # 7-50', anios: 12, proposito: 'Especializada en medicamentos de control especial y estupefacientes', localidad: 'Santa Fe' },
    { nombre: 'Farmavida Centro', direccion: 'Avenida 19 # 25-10', anios: 8, proposito: 'Farmacia céntrica con servicio de maquila y dosificación', localidad: 'Santa Fe' },
    { nombre: 'Salud Macarena', direccion: 'Calle 24 # 5-62', anios: 17, proposito: 'Farmacia de referencia para el sector cultural y turístico', localidad: 'Santa Fe' },
    { nombre: 'DrogExpress San Diego', direccion: 'Carrera 10 # 27-18', anios: 4, proposito: 'Atención rápida con sistema de fichas y dispensación ágil', localidad: 'Santa Fe' },
    { nombre: 'Farmacia Veracruz', direccion: 'Calle 19 # 8-35', anios: 33, proposito: 'Farmacia tradicional con despacho a toda la localidad', localidad: 'Santa Fe' },
    { nombre: 'Droguería La Capuchina', direccion: 'Carrera 8 # 21-60', anios: 26, proposito: 'Medicamentos genéricos a precios populares y financiación', localidad: 'Santa Fe' },
    { nombre: 'FarmaCuidado Las Aguas', direccion: 'Transversal 5 # 28-42', anios: 6, proposito: 'Farmacia con énfasis en salud digestiva y nutrición clínica', localidad: 'Santa Fe' },

    // --- Los Mártires ---
    { nombre: 'Farmacia Mártires Unidos', direccion: 'Calle 12 # 18-35', anios: 14, proposito: 'Farmacia comunitaria con apoyo a poblaciones vulnerables', localidad: 'Los Mártires' },
    { nombre: 'Droguería Samper Mendoza', direccion: 'Carrera 19 # 10-80', anios: 8, proposito: 'Atención especializada en salud pública y medicamentos esenciales', localidad: 'Los Mártires' },
    { nombre: 'Farmavida San Andresito', direccion: 'Calle 10 # 22-60', anios: 5, proposito: 'Farmacia con los precios más competitivos de la zona céntrica', localidad: 'Los Mártires' },
    { nombre: 'Salud Popular', direccion: 'Avenida 1 de Mayo # 20-15', anios: 19, proposito: 'Farmacia social con programas de salud comunitaria', localidad: 'Los Mártires' },
    { nombre: 'DrogExpress Mártires', direccion: 'Carrera 17 # 13-42', anios: 3, proposito: 'Dispensación ágil en la zona comercial del centro', localidad: 'Los Mártires' },
    { nombre: 'Farmacia La Estación', direccion: 'Calle 15 # 21-30', anios: 11, proposito: 'Cerca a la estación de transporte con servicio 24 horas', localidad: 'Los Mártires' },
    { nombre: 'Droguería El Progreso', direccion: 'Transversal 20 # 12-55', anios: 24, proposito: 'Farmacia de barrio con crédito directo y fiado', localidad: 'Los Mártires' },
    { nombre: 'Farmabienestar Mártires', direccion: 'Calle 11 # 16-28', anios: 7, proposito: 'Farmacia con énfasis en medicina familiar y prevención', localidad: 'Los Mártires' },

    // --- La Candelaria ---
    { nombre: 'Farmacia La Candelaria', direccion: 'Calle 10 # 3-56', anios: 50, proposito: 'Farmacia histórica del centro fundacional de Bogotá', localidad: 'La Candelaria' },
    { nombre: 'Droguería Egipto', direccion: 'Carrera 4 # 11-30', anios: 13, proposito: 'Especializada en medicina ancestral y preparaciones tradicionales', localidad: 'La Candelaria' },
    { nombre: 'Farmavida Universidad', direccion: 'Calle 14 # 2-20', anios: 9, proposito: 'Farmacia universitaria con servicios para la comunidad académica', localidad: 'La Candelaria' },
    { nombre: 'Salud Colonial', direccion: 'Carrera 3 # 12-45', anios: 27, proposito: 'Farmacia con atención en inglés y francés para turistas', localidad: 'La Candelaria' },
    { nombre: 'DrogExpress Centro Histórico', direccion: 'Calle 11 # 5-38', anios: 5, proposito: 'Entrega a hoteles y hostales del centro histórico', localidad: 'La Candelaria' },
    { nombre: 'Farmacia Las Aguas', direccion: 'Carrera 2 # 16-22', anios: 38, proposito: 'Farmacia tradicional con servicios de salud alternativa', localidad: 'La Candelaria' },
    { nombre: 'Droguería Santa Bárbara', direccion: 'Calle 12 # 4-18', anios: 20, proposito: 'Medicamentos homeopáticos y fitoterapéuticos certificados', localidad: 'La Candelaria' },
    { nombre: 'FarmaTurismo', direccion: 'Carrera 6 # 13-65', anios: 4, proposito: 'Farmacia de emergencia para turistas con botiquín de viaje', localidad: 'La Candelaria' },

    // --- Antonio Nariño ---
    { nombre: 'Farmacia Antonio Nariño', direccion: 'Calle 20 # 15-70', anios: 18, proposito: 'Farmacia de referencia en la localidad con atención humanizada', localidad: 'Antonio Nariño' },
    { nombre: 'Droguería Restrepo', direccion: 'Carrera 17 # 23-40', anios: 11, proposito: 'Especializada en medicamentos para diabetes y cuidado metabólico', localidad: 'Antonio Nariño' },
    { nombre: 'Farmavida La Fragua', direccion: 'Calle 22 # 12-64', anios: 7, proposito: 'Farmacia de barrio con servicio de nebulizaciones', localidad: 'Antonio Nariño' },
    { nombre: 'Salud Sur', direccion: 'Avenida 1 de Mayo # 18A-32', anios: 31, proposito: 'Farmacia con más de 30 años sirviendo al sur de Bogotá', localidad: 'Antonio Nariño' },
    { nombre: 'DrogExpress Nariño', direccion: 'Carrera 14 # 21-12', anios: 4, proposito: 'Farmacia virtual con envío gratis a toda la localidad', localidad: 'Antonio Nariño' },
    { nombre: 'Farmacia Ciudad Jardín', direccion: 'Transversal 16 # 24-50', anios: 15, proposito: 'Programa de cuidado infantil y medicamentos pediátricos', localidad: 'Antonio Nariño' },
    { nombre: 'Droguería San Vicente', direccion: 'Calle 19 # 13-82', anios: 9, proposito: 'Farmacia con servicios de primeros auxilios y curación', localidad: 'Antonio Nariño' },
    { nombre: 'Familia Farma', direccion: 'Carrera 11 # 22-35', anios: 6, proposito: 'Farmacia con programa de descuentos para familias numerosas', localidad: 'Antonio Nariño' },

    // --- Puente Aranda ---
    { nombre: 'Farmacia Puente Aranda Central', direccion: 'Calle 8 # 35-60', anios: 23, proposito: 'Farmacia industrial con servicios para empresas y fábricas', localidad: 'Puente Aranda' },
    { nombre: 'Droguería La Rivera', direccion: 'Carrera 38 # 6-15', anios: 14, proposito: 'Especializada en salud ocupacional y medicina laboral', localidad: 'Puente Aranda' },
    { nombre: 'Farmavida Industrial', direccion: 'Avenida de Las Américas # 39-22', anios: 10, proposito: 'Farmacia de la zona industrial con horario extendido', localidad: 'Puente Aranda' },
    { nombre: 'Salud Obrera', direccion: 'Calle 5 # 42-80', anios: 19, proposito: 'Farmacia con precios populares para los trabajadores', localidad: 'Puente Aranda' },
    { nombre: 'DrogExpress Puente Aranda', direccion: 'Transversal 36 # 9-44', anios: 5, proposito: 'Servicio de dispensación continua con turnos 24/7', localidad: 'Puente Aranda' },
    { nombre: 'Farmacia La Pradera', direccion: 'Carrera 32 # 7-28', anios: 27, proposito: 'Farmacia tradicional con énfasis en salud cardiovascular', localidad: 'Puente Aranda' },
    { nombre: 'Droguería El Recuerdo', direccion: 'Calle 6 # 34-70', anios: 42, proposito: 'Farmacia histórica de la zona con servicio de implantes', localidad: 'Puente Aranda' },
    { nombre: 'Farmabienestar Aranda', direccion: 'Avenida 40 # 8-55', anios: 7, proposito: 'Farmacia con enfoque en bienestar integral y salud mental', localidad: 'Puente Aranda' },

    // --- San Cristóbal ---
    { nombre: 'Farmacia San Cristóbal Alto', direccion: 'Calle 31 Sur # 8-60', anios: 16, proposito: 'Farmacia comunitaria al servicio de los cerros orientales', localidad: 'San Cristóbal' },
    { nombre: 'Droguería Victoria Sur', direccion: 'Carrera 5 # 26-10 Sur', anios: 9, proposito: 'Atención especializada en salud infantil y vacunación', localidad: 'San Cristóbal' },
    { nombre: 'Farmavida Veinte de Julio', direccion: 'Calle 30 Sur # 10-45', anios: 22, proposito: 'Farmacia de referencia en el barrio Veinte de Julio', localidad: 'San Cristóbal' },
    { nombre: 'Salud Lomas', direccion: 'Carrera 7 # 34-20 Sur', anios: 6, proposito: 'Farmacia de montaña con servicio de entrega a veredas', localidad: 'San Cristóbal' },
    { nombre: 'DrogExpress Sur', direccion: 'Calle 28 Sur # 6-50', anios: 4, proposito: 'Despacho a domicilio en toda la localidad sin recargo', localidad: 'San Cristóbal' },
    { nombre: 'Farmacia La Academia', direccion: 'Transversal 9 # 32-15 Sur', anios: 13, proposito: 'Cerca a colegios con atención de botiquín escolar', localidad: 'San Cristóbal' },
    { nombre: 'Droguería San Martín', direccion: 'Carrera 4 # 29-44 Sur', anios: 18, proposito: 'Farmacia con servicio de toma de muestras básicas', localidad: 'San Cristóbal' },
    { nombre: 'FarmaEsperanza', direccion: 'Calle 25 Sur # 11-38', anios: 8, proposito: 'Farmacia con programa de salud preventiva y charlas educativas', localidad: 'San Cristóbal' },

    // --- Rafael Uribe Uribe ---
    { nombre: 'Farmacia Rafael Uribe Central', direccion: 'Calle 38 Sur # 20-60', anios: 12, proposito: 'Farmacia de referencia con laboratorio clínico integrado', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'Droguería Molinos', direccion: 'Avenida Caracas # 32-18 Sur', anios: 8, proposito: 'Especializada en medicamentos cardiovasculares y control de hipertensión', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'Farmavida Quiroga', direccion: 'Carrera 18 # 35-20 Sur', anios: 17, proposito: 'Farmacia de barrio con servicio de enfermería 24 horas', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'Salud Marruecos', direccion: 'Calle 40 Sur # 15-50', anios: 5, proposito: 'Farmacia con enfoque en medicina familiar y atención primaria', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'DrogExpress Uribe', direccion: 'Transversal 17 # 37-12 Sur', anios: 3, proposito: 'Farmacia digital con pedidos por app y entrega en 20 min', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'Farmacia San Jorge', direccion: 'Carrera 22 # 36-44 Sur', anios: 25, proposito: 'Farmacia tradicional con servicio de ortopedia y rehabilitación', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'Droguería El Carmen', direccion: 'Calle 33 Sur # 19-30', anios: 10, proposito: 'Atención personalizada con programa de medicamentos crónicos', localidad: 'Rafael Uribe Uribe' },
    { nombre: 'FarmaPopular Uribe', direccion: 'Avenida 24 # 39-15 Sur', anios: 7, proposito: 'Farmacia social con descuentos en medicamentos de alto costo', localidad: 'Rafael Uribe Uribe' },

    // --- Tunjuelito ---
    { nombre: 'Farmacia Tunjuelito Park', direccion: 'Calle 46 Sur # 24-40', anios: 14, proposito: 'Farmacia del parque principal con atención a familias', localidad: 'Tunjuelito' },
    { nombre: 'Droguería Tunal', direccion: 'Carrera 19 # 49-15 Sur', anios: 9, proposito: 'Especializada en medicamentos para la tercera edad', localidad: 'Tunjuelito' },
    { nombre: 'Farmavida Nuevo Muzú', direccion: 'Diagonal 45 Sur # 22-80', anios: 6, proposito: 'Farmacia con servicios de promoción y prevención en salud', localidad: 'Tunjuelito' },
    { nombre: 'Salud Tunjuelito', direccion: 'Calle 48 Sur # 26-12', anios: 20, proposito: 'Farmacia de referencia con dispensación de todas las EPS', localidad: 'Tunjuelito' },
    { nombre: 'DrogExpress Tunjuelito', direccion: 'Transversal 21 # 44-38 Sur', anios: 4, proposito: 'Envío gratuito y rápido a toda la localidad de Tunjuelito', localidad: 'Tunjuelito' },
    { nombre: 'Farmacia San Carlos', direccion: 'Carrera 24 # 47-50 Sur', anios: 31, proposito: 'Farmacia tradicional con énfasis en medicina interna', localidad: 'Tunjuelito' },
    { nombre: 'Droguería La Sureña', direccion: 'Calle 42 Sur # 23-20', anios: 16, proposito: 'Atención farmacéutica con programa de descuento por puntos', localidad: 'Tunjuelito' },
    { nombre: 'FarmaBienestar Tunjuelo', direccion: 'Avenida 27 Sur # 46-30', anios: 5, proposito: 'Farmacia con servicios de bienestar y salud comunitaria', localidad: 'Tunjuelito' },

    // --- Usme ---
    { nombre: 'Farmacia Usme Centro', direccion: 'Calle 60 Sur # 5-40', anios: 11, proposito: 'Farmacia del casco urbano de Usme con atención integral', localidad: 'Usme' },
    { nombre: 'Droguería El Porvenir', direccion: 'Carrera 3 # 58-25 Sur', anios: 7, proposito: 'Atención a la población rural con despacho a veredas', localidad: 'Usme' },
    { nombre: 'Farmavida Usme Pueblo', direccion: 'Calle 65 Sur # 6-80', anios: 20, proposito: 'Farmacia tradicional del pueblo de Usme con historia', localidad: 'Usme' },
    { nombre: 'Salud Valle de Usme', direccion: 'Carrera 8 # 62-15 Sur', anios: 5, proposito: 'Farmacia con enfoque en salud ambiental y medicina rural', localidad: 'Usme' },
    { nombre: 'DrogExpress Usme', direccion: 'Transversal 4 # 59-30 Sur', anios: 3, proposito: 'Servicio de moto domicilio a toda Usme urbana y rural', localidad: 'Usme' },
    { nombre: 'Farmacia San Isidro', direccion: 'Calle 63 Sur # 9-45', anios: 14, proposito: 'Farmacia comunitaria con apoyo a jefas de hogar', localidad: 'Usme' },
    { nombre: 'Droguería El Bosque', direccion: 'Carrera 7 # 66-20 Sur', anios: 22, proposito: 'Especialistas en medicina herbolaria y preparaciones naturales', localidad: 'Usme' },
    { nombre: 'FarmaSur Usme', direccion: 'Calle 55 Sur # 5-72', anios: 8, proposito: 'Farmacia con programa de salud visual y venta de lentes', localidad: 'Usme' },

    // --- Kennedy ---
    { nombre: 'Farmacia Kennedy Central', direccion: 'Avenida 68 # 38-55 Sur', anios: 18, proposito: 'Farmacia más grande de la localidad con 6 puntos de atención', localidad: 'Kennedy' },
    { nombre: 'Droguería Corabastos', direccion: 'Calle 22 Sur # 80-40', anios: 12, proposito: 'Especializada en medicamentos veterinarios y agropecuarios', localidad: 'Kennedy' },
    { nombre: 'Farmavida Las Américas', direccion: 'Avenida de Las Américas # 68-38', anios: 25, proposito: 'Farmacia de la avenida principal con atención 24 horas', localidad: 'Kennedy' },
    { nombre: 'Salud Timiza', direccion: 'Carrera 70 # 32-50 Sur', anios: 9, proposito: 'Farmacia del barrio Timiza con servicios de fisioterapia', localidad: 'Kennedy' },
    { nombre: 'DrogExpress Kennedy', direccion: 'Calle 35 Sur # 76-22', anios: 6, proposito: 'Farmacia exprés con puntos de recogida en toda Kennedy', localidad: 'Kennedy' },
    { nombre: 'Farmacia Techo', direccion: 'Calle 30 Sur # 70-18', anios: 14, proposito: 'Atención a poblaciones vulnerables con medicamentos sociales', localidad: 'Kennedy' },
    { nombre: 'Droguería Patio Bonito', direccion: 'Transversal 80 # 28-45 Sur', anios: 8, proposito: 'Farmacia de barrio con servicio de telemedicina', localidad: 'Kennedy' },
    { nombre: 'FarmaKennedy', direccion: 'Avenida 72 # 36-20 Sur', anios: 11, proposito: 'Farmacia con programas de salud preventiva y tamizajes', localidad: 'Kennedy' },

    // --- Bosa ---
    { nombre: 'Farmacia Bosa Centro', direccion: 'Calle 48 Sur # 84-30', anios: 16, proposito: 'Farmacia del casco antiguo de Bosa con tradición', localidad: 'Bosa' },
    { nombre: 'Droguería El Porvenir Bosa', direccion: 'Carrera 88 # 44-20 Sur', anios: 10, proposito: 'Atención especializada en salud infantil y crecimiento', localidad: 'Bosa' },
    { nombre: 'Farmavida Bosa La Vega', direccion: 'Calle 42 Sur # 83-70', anios: 7, proposito: 'Farmacia con servicio de promoción de la salud bucal', localidad: 'Bosa' },
    { nombre: 'Salud Bosa Nueva', direccion: 'Transversal 86 # 46-15 Sur', anios: 5, proposito: 'Farmacia de barrio con atención en medicina estética básica', localidad: 'Bosa' },
    { nombre: 'DrogExpress Bosa', direccion: 'Carrera 80 # 40-55 Sur', anios: 4, proposito: 'Farmacia digital con entrega en bicicleta ecológica', localidad: 'Bosa' },
    { nombre: 'Farmacia San Bernardino', direccion: 'Calle 52 Sur # 90-24', anios: 23, proposito: 'Farmacia tradicional con más de 20 años en la comunidad', localidad: 'Bosa' },
    { nombre: 'Droguería La Estación Bosa', direccion: 'Avenida 84 # 43-50 Sur', anios: 9, proposito: 'Cerca a la estación de Transmilenio con servicio exprés', localidad: 'Bosa' },
    { nombre: 'FarmaFamiliar Bosa', direccion: 'Calle 50 Sur # 86-12', anios: 6, proposito: 'Farmacia con programa de descuentos para familias y grupos', localidad: 'Bosa' },

    // --- Ciudad Bolívar ---
    { nombre: 'Farmacia Ciudad Bolívar', direccion: 'Calle 63 Sur # 26-80', anios: 13, proposito: 'Farmacia de la UPZ Central con atención a la comunidad', localidad: 'Ciudad Bolívar' },
    { nombre: 'Droguería Meissen', direccion: 'Carrera 18 # 58-20 Sur', anios: 8, proposito: 'Especializada en medicamentos para salud respiratoria', localidad: 'Ciudad Bolívar' },
    { nombre: 'Farmavida Arborizadora', direccion: 'Calle 70 Sur # 30-45', anios: 6, proposito: 'Farmacia de montaña con servicio de entrega a veredas', localidad: 'Ciudad Bolívar' },
    { nombre: 'Salud Bolívar', direccion: 'Transversal 25 # 65-30 Sur', anios: 17, proposito: 'Farmacia con énfasis en salud pública y prevención', localidad: 'Ciudad Bolívar' },
    { nombre: 'DrogExpress Bolívar', direccion: 'Carrera 22 # 60-15 Sur', anios: 4, proposito: 'Servicio farmacéutico exprés con entrega sin costo', localidad: 'Ciudad Bolívar' },
    { nombre: 'Farmacia El Tesoro', direccion: 'Calle 68 Sur # 28-50', anios: 21, proposito: 'Farmacia tradicional con servicio de óptica y audiología', localidad: 'Ciudad Bolívar' },
    { nombre: 'Droguería Lucero', direccion: 'Carrera 27 # 72-35 Sur', anios: 10, proposito: 'Atención a pacientes crónicos con programa de adherencia', localidad: 'Ciudad Bolívar' },
    { nombre: 'FarmaSur Bolívar', direccion: 'Calle 62 Sur # 24-28', anios: 7, proposito: 'Farmacia con proyectos de salud comunitaria y brigadas', localidad: 'Ciudad Bolívar' },

    // --- Sumapaz ---
    { nombre: 'Farmacia Sumapaz Rural', direccion: 'Vereda Las Vegas Km 5', anios: 9, proposito: 'Única farmacia del páramo con despacho a todas las veredas', localidad: 'Sumapaz' },
    { nombre: 'Droguería San Juan de Sumapaz', direccion: 'Corregimiento San Juan, Calle Principal 2-30', anios: 15, proposito: 'Farmacia campesina con medicamentos veterinarios y humanos', localidad: 'Sumapaz' },
    { nombre: 'Farmavida Páramo', direccion: 'Vereda Nazareth, Casa 4', anios: 6, proposito: 'Farmacia de altura con plantas medicinales certificadas', localidad: 'Sumapaz' },
    { nombre: 'Salud Campesina', direccion: 'Vereda La Unión, Vía al Páramo', anios: 12, proposito: 'Atención farmacéutica rural con brigadas mensuales', localidad: 'Sumapaz' },
    { nombre: 'DrogExpress Sumapaz', direccion: 'Centro Poblado La Vega, Local 3', anios: 4, proposito: 'Servicio de farmacia móvil que recorre todas las veredas', localidad: 'Sumapaz' },
    { nombre: 'Farmacia El Páramo', direccion: 'Vereda El Hato, Casa 22', anios: 20, proposito: 'Farmacia tradicional con preparaciones de medicina ancestral', localidad: 'Sumapaz' },
    { nombre: 'Droguería Las Nubes', direccion: 'Corregimiento Betania, Calle 1 # 5-08', anios: 11, proposito: 'Farmacia rural con programa de teleasistencia farmacéutica', localidad: 'Sumapaz' },
    { nombre: 'FarmaPáramo Sostenible', direccion: 'Vereda Los Ríos, Finca 7', anios: 5, proposito: 'Farmacia ecológica con intercambio de plantas medicinales', localidad: 'Sumapaz' },
  ];

  const seedData = farmacias.map((f, i) => {
    const c = C[f.localidad];
    const off = offsets[i % offsets.length];
    return {
      id: i + 1,
      ...f,
      lat: c ? +(c[0] + off[0]).toFixed(6) : 4.6,
      lng: c ? +(c[1] + off[1]).toFixed(6) : -74.1,
      createdAt: new Date(2025, 0, 1 + i).toISOString(),
    };
  });

  localStorage.setItem(SEED_FLAG, '1');
  localStorage.setItem('farmabogota.pharmacies.v1', JSON.stringify(seedData));
})();
