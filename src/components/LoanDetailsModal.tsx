import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/calculations';

interface LoanDetailsModalProps {
  loan: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({ loan, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    dueDate: '',
    status: '',
  });

  useEffect(() => {
    if (loan) {
      setFormData({
        amount: loan.amount,
        interestRate: loan.interestRate,
        dueDate: loan.dueDate ? format(new Date(loan.dueDate), 'yyyy-MM-dd') : '',
        status: loan.status,
      });
    }
  }, [loan]);

  const handleUpdate = async () => {
    try {
      const dataToUpdate = {
        ...formData,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        totalAmount: parseFloat(formData.amount) * (1 + parseFloat(formData.interestRate) / 100)
      };
      await onUpdate(loan.id, dataToUpdate);
      toast.success('Empréstimo atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar empréstimo.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza?')) {
      try {
        await onDelete(loan.id);
        toast.success('Empréstimo excluído com sucesso!');
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Erro ao excluir empréstimo.');
      }
    }
  };
  
  const totalPaid = loan.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const remaining = Number(loan.totalAmount) - totalPaid;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Detalhes do Empréstimo
            {loan.loanNumber && (
              <span className="text-base font-normal text-gray-400 ml-2">
                #{String(loan.loanNumber).padStart(6, '0')}
              </span>
            )}
          </h2>
          <div>
            <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-gray-400 hover:text-white rounded-lg mr-2">
              {isEditing ? <X size={20} /> : <Edit size={20} />}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Cliente</h3>
            <p className="text-gray-300">{loan.client?.name}</p>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-700/50">
              <div>
                <label className="text-sm text-gray-400">Valor Emprestado</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full mt-1 bg-gray-900 p-2 rounded border border-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Taxa de Juros (%)</label>
                <input type="number" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: e.target.value})} className="w-full mt-1 bg-gray-900 p-2 rounded border border-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Data de Vencimento</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full mt-1 bg-gray-900 p-2 rounded border border-gray-600" />
              </div>
               <div>
                <label className="text-sm text-gray-400">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full mt-1 bg-gray-900 p-2 rounded border border-gray-600">
                    <option value="active">Ativo</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Atrasado</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-sm text-gray-400">Total Emprestado</p><p className="font-medium text-white">{formatCurrency(Number(loan.amount))}</p></div>
              <div><p className="text-sm text-gray-400">Juros</p><p className="font-medium text-white">{loan.interestRate}%</p></div>
              <div><p className="text-sm text-gray-400">Total a Pagar</p><p className="font-medium text-white">{formatCurrency(Number(loan.totalAmount))}</p></div>
              <div><p className="text-sm text-gray-400">Status</p><p className="font-medium text-white">{loan.status}</p></div>
            </div>
          )}
          
           <div className="bg-gray-700/50 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Histórico de Pagamentos</h3>
              {loan.payments?.length > 0 ? (
                <ul className="space-y-2">
                  {loan.payments.map((p: any) => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{format(new Date(p.paymentDate), 'dd/MM/yyyy', {locale: ptBR})}</span>
                      <span className="text-green-400 font-medium">{formatCurrency(Number(p.amount))}</span>
                    </li>
                  ))}
                   <li className="flex justify-between text-sm border-t border-gray-600 pt-2 mt-2">
                      <span className="text-white font-bold">Total Pago</span>
                      <span className="text-white font-bold">{formatCurrency(totalPaid)}</span>
                    </li>
                    <li className="flex justify-between text-sm">
                      <span className="text-yellow-400 font-bold">Restante</span>
                      <span className="text-yellow-400 font-bold">{formatCurrency(remaining)}</span>
                    </li>
                </ul>
              ) : (
                <p className="text-sm text-gray-400">Nenhum pagamento registrado.</p>
              )}
           </div>
        </div>
        
        <div className="flex justify-between p-6 border-t border-gray-700">
          <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center gap-2">
            <Trash2 size={16}/> Excluir
          </button>
          {isEditing && (
            <button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2">
              <Save size={16} /> Salvar Alterações
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsModal;