/**
 * Todos los textos de la app, en español e inglés.
 * All app text, in Spanish and English.
 *
 * REGLA: si agregas una palabra a `es`, la agregas a `en` en la misma edición.
 * RULE: if you add a string to `es`, you add it to `en` in the same edit.
 * TypeScript no compila si falta una. / TypeScript will not compile if one is missing.
 */

export const es = {
  /* ---- lista ---- */
  totalOwed: 'Total:',
  totalOutstanding: 'Total pendiente',
  activeBalances: 'Deudas activas',
  peopleCount: (n: number) => (n === 1 ? '1 persona' : n + ' personas'),
  seeAll: 'Ver todas',
  homeTab: 'Pagos',
  peopleTab: 'Personas',
  search: 'Buscar por nombre…',
  owing: 'Todavía me deben',
  settled: 'Ya no me deben nada',
  settledBadge: 'Pagó todo',
  overpaid: 'Pagó de más',
  overpaidBy: (m: string) => 'Pagó ' + m + ' de más',
  emptyList: 'Todavía no hay nadie en la lista.\nToca ＋ para agregar a alguien.',
  noResults: 'Nadie con ese nombre.',
  noMovs: 'Sin nada anotado',
  lastMov: (d: string) => 'Último apunte: ' + d,

  /* ---- limite gratis ---- */
  freeLimitEmpty: (max: number) => 'Gratis hasta ' + max + ' personas.',
  freeLimitCount: (n: number, max: number) => n + ' de ' + max + ' personas',

  /* ---- enviar saldo ---- */
  sendBalance: 'Enviar saldo',
  sendBalanceTitle: 'Enviar saldo',
  balanceMessage: (name: string, date: string, lent: string, paid: string, balance: string) =>
    'Hola ' + name + ' — resumen al ' + date + ': prestado ' + lent + ', pagado ' + paid + ', saldo ' + balance,
  shareFailed: 'No se pudo compartir.',

  /* ---- detalle ---- */
  owesMeNow: 'Me debe ahora',
  history: 'Historial de pagos',
  borrowed: 'Deuda',
  paidBtn: 'Pagado',
  emptyMovs: 'Todavía no has anotado nada de esta persona.',
  currentBalance: 'Saldo actual',
  gaveShort: 'Le di dinero',
  gaveEffect: 'Sube lo que debe',
  gotShort: 'Me pagó',
  gotEffect: 'Baja lo que debe',
  gaveLong: 'Le di dinero',
  gotLong: 'Me pagó',

  /* ---- persona ---- */
  newPerson: 'Agregar persona',
  peopleTitle: 'Personas',
  allPeople: 'Todas las personas',
  noPeopleTitle: 'Vacío',
  noPeopleBody: 'Sin contactos',
  editPerson: 'Cambiar datos',
  name: 'Nombre',
  namePh: 'Juan',
  noteOpt: 'Nota (opcional)',
  personNotePh: 'Teléfono, dirección…',
  addNote: 'Nota',
  movNotePh: 'Efectivo, Zelle…',

  /* ---- nueva entrada ---- */
  newEntry: 'Nuevo apunte',
  amount: 'Cantidad',
  currency: 'Moneda',
  chooseCurrency: 'Elegir moneda',
  person: 'Persona',
  choosePerson: 'Elegir persona',
  phoneBook: 'Agenda del teléfono',
  fromExisting: 'Elegir existente',
  enterManually: 'Escribir manualmente',
  existingPeopleTitle: 'Personas en Pagos',
  noExistingPeople: 'Todavía no hay personas guardadas.',
  manualPersonTitle: '¿Quién?',
  orChooseExisting: 'Elegir de mis personas',
  orFromContacts: 'Buscar en Contactos',
  personRequired: 'Elige o escribe una persona',
  contactsDeniedTitle: 'Acceso a contactos denegado',
  contactsDeniedBody: 'Activa el acceso a Contactos para Pagos en los ajustes del iPhone, o escribe el nombre manualmente.',
  contactsUnavailable: 'Los contactos no están disponibles en este dispositivo.',
  contactsFailed: 'No se pudo abrir la agenda del teléfono.',
  dueDate: 'Fecha de cobro',
  dueDateOn: 'Recordatorio activado',
  dueDateOff: 'Sin recordatorio',
  notePlaceholder: 'Escribe aquí',
  addDebt: 'Agregar deuda',
  addPayment: 'Anotar pago',
  sampleDate: '29 ago 2026',
  sampleLastEntry: '11 ago 2026',
  sampleCash: 'Efectivo',
  sampleZelle: 'Zelle',

  /* ---- generales ---- */
  today: 'hoy',
  cancel: 'Cancelar',
  save: 'Guardar',
  close: 'Cerrar',
  options: 'Opciones',
  language: 'Idioma',
  openOptions: 'Abrir opciones',
  addEntryA11y: 'Agregar un apunte',
  goBack: 'Volver',
  moreActions: 'Más acciones',
  confirm: 'Confirmar',
  delete: 'Borrar',
  viewPerson: 'Ver persona',

  /* ---- menú ---- */
  mBackup: 'Copia de seguridad',
  mBackupD: 'Archivo para volver a cargar en la app',
  mExport: 'Exportar lista',
  mExportD: 'Texto para leer, imprimir o enviar',
  mRestore: 'Restaurar desde copia',
  mRestoreD: 'Reemplaza todo con un archivo de copia',
  noBackupYet: 'Todavía no has guardado ninguna copia. Todo vive solo en este teléfono.',
  localOnlyTitle: 'Tus datos se quedan aquí',
  localOnlyBody: 'Pagos guarda todo solamente en este teléfono. Se incluye en la copia de seguridad de tu iPhone.',
  restoreConfirm: 'Esto reemplaza todo lo que tienes ahora. ¿Seguir?',
  restoreFailed: 'No se pudo leer ese archivo.',
  backupFailed: 'No se pudo compartir la copia de seguridad.',
  exportFailed: 'No se pudo compartir la lista.',
  lastBackup: (d: string, n: number) =>
    'Última copia: ' + d + '. Cosas anotadas desde entonces: ' + n + '.',

  /* ---- avisos ---- */
  confirmDelPerson: (n: string) => '¿Borrar a ' + n + ' y todo lo anotado de esta persona?',
  confirmDelMov: '¿Borrar este apunte?',
  confirmRestore: 'Esto reemplaza todo lo que tienes ahora. ¿Seguir?',
  needName: 'Escribe un nombre',
  needAmount: 'Escribe cuánto',
  saveFail: 'No se pudo guardar',
  restored: 'Todo quedó restaurado',
  badFile: 'Ese archivo no sirve',
  backupHint: 'Elige "Guardar en Archivos" → iCloud Drive',
  exportHint: 'Elige "Guardar en Archivos" o compártelo',
  rememberBackup: 'Acuérdate de guardar una copia',
  savedGave: (m: string) => 'Anotado: le diste ' + m,
  savedGot: (m: string) => 'Anotado: te pagó ' + m,

  months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],

  /* ---- exportar ---- */
  exTitle: 'Lista de pagos',
  exOwes: 'Me debe ',
  exSettled: 'Ya no me debe nada',
  exNone: '(nada anotado)',
  exOn: 'el ',
  exAt: ' a las ',
  exTotal: 'Total que me deben: ',
  exPeople: 'Personas en la lista: ',
  exNobody: 'Todavía no hay nadie en la lista.',
};

/** La forma del texto. `en` tiene que tener exactamente estas mismas palabras. */
export type Strings = typeof es;

export const en: Strings = {
  /* ---- list ---- */
  totalOwed: 'Total:',
  totalOutstanding: 'Total outstanding',
  activeBalances: 'Active balances',
  peopleCount: (n: number) => (n === 1 ? '1 person' : n + ' people'),
  seeAll: 'See all',
  homeTab: 'Pagos',
  peopleTab: 'People',
  search: 'Search by name…',
  owing: 'Still owe me',
  settled: 'All paid up',
  settledBadge: 'Paid in full',
  overpaid: 'Overpaid',
  overpaidBy: (m: string) => 'Overpaid by ' + m,
  emptyList: 'Nobody on the list yet.\nTap ＋ to add someone.',
  noResults: 'Nobody by that name.',
  noMovs: 'Nothing written down',
  lastMov: (d: string) => 'Last entry: ' + d,

  /* ---- free limit ---- */
  freeLimitEmpty: (max: number) => 'Free for up to ' + max + ' people.',
  freeLimitCount: (n: number, max: number) => n + ' of ' + max + ' people',

  /* ---- send balance ---- */
  sendBalance: 'Send balance',
  sendBalanceTitle: 'Send balance',
  balanceMessage: (name: string, date: string, lent: string, paid: string, balance: string) =>
    'Hi ' + name + ' — summary as of ' + date + ': lent ' + lent + ', paid ' + paid + ', balance ' + balance,
  shareFailed: 'Could not share.',

  /* ---- detail ---- */
  owesMeNow: 'Owes me right now',
  history: 'Payment History',
  borrowed: 'Borrowed',
  paidBtn: 'Paid',
  emptyMovs: 'Nothing written down for this person yet.',
  currentBalance: 'Current balance',
  gaveShort: 'I gave money',
  gaveEffect: 'Owes me more',
  gotShort: 'They paid me',
  gotEffect: 'Owes me less',
  gaveLong: 'I gave money',
  gotLong: 'They paid me',

  /* ---- person ---- */
  newPerson: 'Add person',
  peopleTitle: 'People',
  allPeople: 'All people',
  noPeopleTitle: 'Empty',
  noPeopleBody: 'No contacts',
  editPerson: 'Change details',
  name: 'Name',
  namePh: 'John',
  noteOpt: 'Note (optional)',
  personNotePh: 'Phone, address…',
  addNote: 'Note',
  movNotePh: 'Cash, Zelle…',

  /* ---- new entry ---- */
  newEntry: 'New entry',
  amount: 'Amount',
  currency: 'Currency',
  chooseCurrency: 'Choose currency',
  person: 'Person',
  choosePerson: 'Choose a person',
  phoneBook: 'Phone book',
  fromExisting: 'From existing',
  enterManually: 'Enter manually',
  existingPeopleTitle: 'People in Pagos',
  noExistingPeople: 'There are no saved people yet.',
  manualPersonTitle: 'Who?',
  orChooseExisting: 'Choose from my people',
  orFromContacts: 'Search Contacts',
  personRequired: 'Choose or enter a person',
  contactsDeniedTitle: 'Contacts access denied',
  contactsDeniedBody: 'Enable Contacts access for Pagos in iPhone Settings, or enter the name manually.',
  contactsUnavailable: 'Contacts are not available on this device.',
  contactsFailed: 'The phone book could not be opened.',
  dueDate: 'Due date',
  dueDateOn: 'Reminder on',
  dueDateOff: 'No reminder',
  notePlaceholder: 'Enter your text',
  addDebt: 'Add debt',
  addPayment: 'Record payment',
  sampleDate: 'Aug 29, 2026',
  sampleLastEntry: 'Aug 11, 2026',
  sampleCash: 'Cash',
  sampleZelle: 'Zelle',

  /* ---- general ---- */
  today: 'today',
  cancel: 'Cancel',
  save: 'Save',
  close: 'Close',
  options: 'Options',
  language: 'Language',
  openOptions: 'Open options',
  addEntryA11y: 'Add an entry',
  goBack: 'Go back',
  moreActions: 'More actions',
  confirm: 'Confirm',
  delete: 'Delete',
  viewPerson: 'View person',

  /* ---- menu ---- */
  mBackup: 'Backup file',
  mBackupD: 'File to load back into the app',
  mExport: 'Export list',
  mExportD: 'Plain text to read, print or send',
  mRestore: 'Restore from backup',
  mRestoreD: 'Replaces everything with a backup file',
  noBackupYet: 'You have not saved a backup yet. Everything lives only on this phone.',
  localOnlyTitle: 'Your data stays here',
  localOnlyBody: 'Pagos stores everything only on this phone. It is included in your iPhone backup.',
  restoreConfirm: 'This replaces everything you have now. Continue?',
  restoreFailed: 'Could not read that file.',
  backupFailed: 'The backup file could not be shared.',
  exportFailed: 'The list could not be shared.',
  lastBackup: (d: string, n: number) =>
    'Last backup: ' + d + '. Entries added since then: ' + n + '.',

  /* ---- warnings ---- */
  confirmDelPerson: (n: string) => 'Delete ' + n + ' and everything written down for them?',
  confirmDelMov: 'Delete this entry?',
  confirmRestore: 'This replaces everything you have now. Continue?',
  needName: 'Enter a name',
  needAmount: 'Enter how much',
  saveFail: 'Could not save',
  restored: 'Everything was restored',
  badFile: 'That file does not work',
  backupHint: 'Choose "Save to Files" → iCloud Drive',
  exportHint: 'Choose "Save to Files" or share it',
  rememberBackup: 'Remember to save a backup',
  savedGave: (m: string) => 'Written down: you gave ' + m,
  savedGot: (m: string) => 'Written down: they paid ' + m,

  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  /* ---- export ---- */
  exTitle: 'Payment list',
  exOwes: 'Owes me ',
  exSettled: 'Owes me nothing',
  exNone: '(nothing written down)',
  exOn: 'on ',
  exAt: ' at ',
  exTotal: 'Total owed to me: ',
  exPeople: 'People on the list: ',
  exNobody: 'Nobody on the list yet.',
};

export const dict = { es, en };

/** 'es' | 'en' — el español es el idioma por defecto. Spanish is the default. */
export type Lang = keyof typeof dict;

export const DEFAULT_LANG: Lang = 'es';
