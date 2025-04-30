import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, Clock, Search } from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

interface QuickActionsProps {
  onSelectAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction }) => {
  const actions: QuickAction[] = [
    {
      id: 'search',
      title: 'Find Flights',
      icon: <Search className="text-blue-500" />,
      action: () => onSelectAction("I want to search for flights")
    },
    {
      id: 'deals',
      title: 'Best Deals',
      icon: <Plane className="text-green-500" />,
      action: () => onSelectAction("Show me the best flight deals today")
    },
    {
      id: 'weekend',
      title: 'Weekend Getaway',
      icon: <Calendar className="text-purple-500" />,
      action: () => onSelectAction("I need a weekend getaway flight")
    },
    {
      id: 'last-minute',
      title: 'Last Minute',
      icon: <Clock className="text-orange-500" />,
      action: () => onSelectAction("Are there any last-minute flight deals?")
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="px-3 sm:px-4 py-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="text-sm font-medium text-gray-500 mb-2">Quick Actions</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            onClick={action.action}
            className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            variants={item}
            whileHover={{ y: -3 }}
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">{action.title}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;