export function downloadBlob(blob: Blob, filename: string): void {
  const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download=filename; anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export const safeFilename = (value: string): string => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"").toLowerCase() || "aluno";
