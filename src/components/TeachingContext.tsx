import { createContext, useContext, type ReactNode } from 'react';
import type { JourneyRecords } from '../journey-learning';
const Context = createContext<{
  records: JourneyRecords;
  update: (records: JourneyRecords) => void;
}>({ records: {}, update: () => {} });
export const useTeaching = () => useContext(Context);
export function TeachingProvider({
  records,
  update,
  children,
}: {
  records: JourneyRecords;
  update: (records: JourneyRecords) => void;
  children: ReactNode;
}) {
  return <Context.Provider value={{ records, update }}>{children}</Context.Provider>;
}
