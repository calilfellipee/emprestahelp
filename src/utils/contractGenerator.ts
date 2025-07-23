import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from './calculations';

export const generateContractPDF = (user: any, client: any, loan: any) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  const addTitle = (text: string) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(text, pageWidth / 2, y, { align: 'center' });
    y += 12;
  };

  const addSectionTitle = (text: string) => {
    y += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, y);
    y += 7;
  };
  
  const addParagraph = (text: string) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(splitText, margin, y);
    y += (splitText.length * 5) + 4;
  };

  // --- Conteúdo do Contrato ---
  addTitle('INSTRUMENTO PARTICULAR DE CONTRATO DE MÚTUO FINANCEIRO');
  
  addSectionTitle('1. DAS PARTES');
  addParagraph(
    `CREDOR: ${user.companyName || user.name}, adiante designado(a) simplesmente como CREDOR, inscrito(a) no CNPJ/CPF sob o nº ${user.companyCnpj || '[Não informado]'}, com sede em ${user.companyAddress || '[Não informado]'}.`
  );
  addParagraph(
    `DEVEDOR: ${client.name}, adiante designado(a) simplesmente como DEVEDOR(A), inscrito(a) no CPF sob o nº ${client.cpf || '[Não informado]'}, RG nº ${client.rg || '[Não informado]'}, residente e domiciliado(a) em ${client.address}.`
  );

  addSectionTitle('2. DO OBJETO');
  addParagraph(
    `Pelo presente instrumento, o CREDOR concede ao DEVEDOR(A), a título de mútuo, a quantia de ${formatCurrency(Number(loan.amount))}. O DEVEDOR(A) declara ter recebido o valor nesta data, dando plena e total quitação.`
  );

  addSectionTitle('3. DO PAGAMENTO E ENCARGOS');
  addParagraph(
    `O DEVEDOR(A) se compromete a restituir a quantia mutuada acrescida de juros de ${loan.interestRate}%. O valor total do débito, de ${formatCurrency(Number(loan.totalAmount))}, será pago até a data de vencimento em ${format(new Date(loan.dueDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}.`
  );
  
  addSectionTitle('4. DO INADIMPLEMENTO');
  addParagraph(
    `O não pagamento na data aprazada implicará na incidência de multa de ${loan.lateFeePercentage}% sobre o saldo devedor, acrescido de juros de mora de ${loan.dailyInterestRate}% ao dia, sem prejuízo da execução do presente instrumento.`
  );

  addSectionTitle('5. DO FORO');
  addParagraph(
    'As partes elegem o foro da comarca da cidade do CREDOR para dirimir quaisquer controvérsias oriundas deste contrato.'
  );

  y += 25;
  doc.text(`${user.companyCity || 'Cidade'}, ${format(new Date(), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}.`, margin, y);
  
  y += 20;
  doc.text('___________________________________________', margin, y);
  doc.text(`${user.companyName || user.name}`, margin, y + 5);
  doc.text('CREDOR', margin, y + 10);
  
  y += 20;
  doc.text('___________________________________________', margin, y);
  doc.text(`${client.name}`, margin, y + 5);
  doc.text('DEVEDOR(A)', margin, y + 10);


  doc.save(`Contrato_${client.name.replace(/\s/g, '_')}_${loan.loanNumber || loan.id.substring(0,4)}.pdf`);
};