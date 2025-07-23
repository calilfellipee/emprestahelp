import React from 'react';
import { CreditCard, Check, Star } from 'lucide-react';

const Subscription: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: 'R$ 0',
      period: '/mês',
      features: [
        'Até 2 clientes',
        'Até 3 empréstimos',
        'Dashboard básico',
        'Suporte por email'
      ],
      current: true,
      buttonText: 'Plano Atual',
      buttonDisabled: true
    },
    {
      name: 'Pro',
      price: 'R$ 25',
      period: '/mês',
      features: [
        'Até 50 clientes',
        'Até 100 empréstimos',
        'Exportação PDF/Excel',
        'WhatsApp manual',
        'Gráficos avançados'
      ],
      popular: true,
      buttonText: 'Assinar Pro',
      buttonDisabled: false
    },
    {
      name: 'Premium',
      price: 'R$ 50',
      period: '/mês',
      features: [
        'Clientes ilimitados',
        'Empréstimos ilimitados',
        'Contratos automáticos',
        'WhatsApp automático',
        'Multiusuário',
        'Logs e auditoria'
      ],
      buttonText: 'Assinar Premium',
      buttonDisabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-gray-400 text-lg">
            Selecione o plano ideal para seu negócio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border ${
                plan.popular
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.buttonDisabled}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  plan.current
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Todos os planos incluem suporte técnico e atualizações gratuitas
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <span>✓ Pagamento seguro</span>
            <span>✓ Cancele a qualquer momento</span>
            <span>✓ Sem taxa de setup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;