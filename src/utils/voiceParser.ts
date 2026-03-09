import { TransactionType } from '../types';

interface ParsedVoiceTransaction {
  amount: number | null;
  description: string;
  category: string;
  type: TransactionType;
}

const categoryKeywords: Record<string, string[]> = {
  food: ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'café', 'pizza', 'hamburguesa', 'tacos', 'sushi', 'antojitos', 'pan', 'dulces'],
  transport: ['transporte', 'taxi', 'uber', 'lyft', 'gasolina', 'combustible', 'metro', 'bus', 'peaje', 'estacionamiento', 'tren', 'avión', 'vuelo'],
  housing: ['alquiler', 'renta', 'luz', 'agua', 'internet', 'teléfono', 'mantenimiento', 'hipoteca', 'departamento', 'casa'],
  utilities: ['servicio', 'servicios', 'mensual', 'suscrito', 'netflix', 'spotify', 'amazon', 'hulu', 'disney', 'celular', 'recarga'],
  entertainment: ['cine', 'película', 'juego', 'concierto', 'fiesta', 'entretenimiento', 'bar', 'cerveza', 'vino', 'bebida', 'televisión'],
  health: ['doctor', 'medicina', 'hospital', 'salud', 'dentista', 'farma', 'farmacia', 'clínica', 'consulta', 'análisis'],
  education: ['escuela', 'curso', 'libro', 'universidad', 'estudios', 'educación', 'inscripción', 'colegiatura'],
  shopping: ['ropa', 'zapatos', 'compras', 'tienda', 'mercado', 'supermercado', 'walmart', 'costco', 'elektra', 'amazon'],
  salary: ['salario', 'sueldo', 'pago', 'trabajo', 'bono', 'nómina', ' quincena'],
  investment: ['inversión', 'dividendo', 'rendimiento', 'crypto', 'bitcoin', 'acciones', 'fondos'],
  gift: ['regalo', 'premio', 'lotería', 'ganancia', 'premio'],
  other_expense: ['otro', 'otros', 'varios', 'gasto'],
  other_income: ['otro', 'otros', 'varios', 'ingreso'],
};

const amountPatterns = [
  /(\d+(?:\.\d{1,2})?)\s*(?:pesos?|soles?|dolares?|usd|\$\s*)?/i,
  /\$\s*(\d+(?:\.\d{1,2})?)/i,
  /(\d+)\s*(?:mxn|ars)/i,
];

const incomeKeywords = ['ingreso', 'gané', 'recibí', 'cobré', 'paguen', 'salario', 'sueldo', 'inversión', 'dividendo', 'ganancia', 'cobro', 'deposite', 'depósito'];
const expenseKeywords = ['gasté', 'pagué', 'pague', 'gaste', 'pagué', 'pagando', 'gastando', 'compré', 'compre', 'comprando', 'cobro', 'cuesta', 'costó'];

export const parseVoiceTransaction = (text: string): ParsedVoiceTransaction => {
  const lowerText = text.toLowerCase();
  
  let amount: number | null = null;
  for (const pattern of amountPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      break;
    }
  }

  let type: TransactionType = 'expense';
  if (incomeKeywords.some(keyword => lowerText.includes(keyword))) {
    type = 'income';
  } else if (expenseKeywords.some(keyword => lowerText.includes(keyword))) {
    type = 'expense';
  }

  let category = type === 'income' ? 'salary' : 'other_expense';
  
  for (const [catId, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      category = catId;
      break;
    }
  }

  const cleanText = lowerText
    .replace(/\$\s*\d+(?:\.\d{1,2})?/g, '')
    .replace(/\d+(?:\.\d{1,2})?\s*(?:pesos?|soles?|dolares?|usd)/gi, '')
    .replace(/gasté|gasté|pagué|pagué|ingresé|ingreso|recibí/gi, '')
    .trim();

  const description = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

  return {
    amount,
    description: description || 'Transacción por voz',
    category,
    type,
  };
};
