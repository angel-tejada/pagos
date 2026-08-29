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

  /* ---- detalle ---- */
  owesMeNow: 'Me debe ahora',
  history: 'Historial de pagos',
  borrowed: 'Deuda',
  paidBtn: 'Pagado',
  emptyMovs: 'Todavía no has anotado nada de esta persona.',
  gaveShort: 'Le di dinero',
  gaveEffect: 'Sube lo que debe',
  gotShort: 'Me pagó',
  gotEffect: 'Baja lo que debe',
  gaveLong: 'Le di dinero',
  gotLong: 'Me pagó',

  /* ---- persona ---- */
  newPerson: 'Agregar persona',
  editPerson: 'Cambiar datos',
  name: 'Nombre',
  namePh: 'Juan',
  noteOpt: 'Nota (opcional)',
  personNotePh: 'Teléfono, dirección…',
  addNote: 'Nota',
  movNotePh: 'Efectivo, Zelle…',

  /* ---- generales ---- */
  today: 'hoy',
  cancel: 'Cancelar',
  save: 'Guardar',
  close: 'Cerrar',
  options: 'Opciones',

  /* ---- menú ---- */
  mBackup: 'Copia de seguridad',
  mBackupD: 'Archivo para volver a cargar en la app',
  mExport: 'Exportar lista',
  mExportD: 'Texto para leer, imprimir o enviar',
  mRestore: 'Restaurar desde copia',
  mRestoreD: 'Reemplaza todo con un archivo de copia',
  noBackupYet: 'Todavía no has guardado ninguna copia. Todo vive solo en este teléfono.',
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

  /* ---- detail ---- */
  owesMeNow: 'Owes me right now',
  history: 'Payment History',
  borrowed: 'Borrowed',
  paidBtn: 'Paid',
  emptyMovs: 'Nothing written down for this person yet.',
  gaveShort: 'I gave money',
  gaveEffect: 'Owes me more',
  gotShort: 'They paid me',
  gotEffect: 'Owes me less',
  gaveLong: 'I gave money',
  gotLong: 'They paid me',

  /* ---- person ---- */
  newPerson: 'Add person',
  editPerson: 'Change details',
  name: 'Name',
  namePh: 'John',
  noteOpt: 'Note (optional)',
  personNotePh: 'Phone, address…',
  addNote: 'Note',
  movNotePh: 'Cash, Zelle…',

  /* ---- general ---- */
  today: 'today',
  cancel: 'Cancel',
  save: 'Save',
  close: 'Close',
  options: 'Options',

  /* ---- menu ---- */
  mBackup: 'Backup file',
  mBackupD: 'File to load back into the app',
  mExport: 'Export list',
  mExportD: 'Plain text to read, print or send',
  mRestore: 'Restore from backup',
  mRestoreD: 'Replaces everything with a backup file',
  noBackupYet: 'You have not saved a backup yet. Everything lives only on this phone.',
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
