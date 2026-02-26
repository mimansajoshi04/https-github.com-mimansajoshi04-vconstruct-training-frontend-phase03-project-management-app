// External Libraries
import { createContext } from 'react';

const DBContext = createContext<IDBDatabase | null>(null);

export default DBContext;
