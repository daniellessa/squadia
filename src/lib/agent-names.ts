// Lista de nomes por locale
const ptNames = [
  "Ana", "Beatriz", "Carlos", "Daniel", "Fernanda",
  "Gabriel", "Helena", "Igor", "Julia", "Lucas",
  "Marina", "Nicolas", "Olivia", "Pedro", "Rafaela",
  "Sofia", "Thiago", "Valentina", "Yasmin", "Zara"
];

const enNames = [
  "Alex", "Blake", "Cameron", "Dana", "Ellis",
  "Finley", "Harper", "Jordan", "Kennedy", "Logan",
  "Morgan", "Noah", "Olivia", "Parker", "Quinn",
  "Riley", "Sage", "Taylor", "Uma", "Wren"
];

const esNames = [
  "Alejandro", "Camila", "Diego", "Elena", "Fernando",
  "Gabriela", "Hugo", "Isabella", "Javier", "Lucia",
  "Miguel", "Natalia", "Oscar", "Paula", "Rafael",
  "Sofia", "Tomas", "Valentina", "Xavier", "Yara"
];

const frNames = [
  "Adèle", "Baptiste", "Camille", "Damien", "Elise",
  "François", "Gabriel", "Hélène", "Inès", "Julien",
  "Léa", "Mathieu", "Noémie", "Olivier", "Pauline",
  "Quentin", "Romain", "Sophie", "Thomas", "Valentine"
];

const deNames = [
  "Anna", "Ben", "Clara", "David", "Emma",
  "Felix", "Greta", "Hans", "Ida", "Jonas",
  "Klara", "Leon", "Mia", "Niklas", "Olivia",
  "Paul", "Rosa", "Simon", "Tina", "Ulrich"
];

const jaNames = [
  "Akira", "Chiyo", "Daiki", "Emi", "Fumio",
  "Hana", "Ichiro", "Jun", "Kenji", "Luna",
  "Miku", "Naoki", "Rin", "Sora", "Taro",
  "Yuki", "Haruto", "Aoi", "Ren", "Sakura"
];

const zhNames = [
  "Bao", "Chen", "Fang", "Guo", "Hui",
  "Jin", "Kai", "Li", "Ming", "Ning",
  "Qi", "Rui", "Shan", "Wei", "Xiao",
  "Yang", "Zhen", "Lin", "Mei", "Tao"
];

/**
 * Gera um nome aleatório para agente baseado no locale do browser
 * @param locale - Locale do usuário (opcional, usa navigator.language se não fornecido)
 * @returns Nome aleatório apropriado para o locale
 */
export function generateAgentName(locale?: string): string {
  // Detecta o locale do browser se não foi passado
  const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

  // Extrai a parte do idioma (antes do hífen)
  const languageCode = userLocale.split('-')[0].toLowerCase();

  // Seleciona a lista de nomes baseada no idioma
  let nameList: string[];

  switch (languageCode) {
    case 'pt':
      nameList = ptNames;
      break;
    case 'es':
      nameList = esNames;
      break;
    case 'fr':
      nameList = frNames;
      break;
    case 'de':
      nameList = deNames;
      break;
    case 'ja':
      nameList = jaNames;
      break;
    case 'zh':
      nameList = zhNames;
      break;
    case 'en':
    default:
      nameList = enNames;
      break;
  }

  // Retorna um nome aleatório da lista
  const randomIndex = Math.floor(Math.random() * nameList.length);
  return nameList[randomIndex];
}
