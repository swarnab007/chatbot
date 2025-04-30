import React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header
      className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 shadow-md rounded-t-xl flex items-center justify-between"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <motion.div
          whileHover={{ rotate: 25 }}
          className="mr-2"
        >
          <Plane size={24} />
        </motion.div>
        <h1 className="text-xl font-bold">SkyChat</h1>
      </div>
    </motion.header>
  );
};

export default Header;