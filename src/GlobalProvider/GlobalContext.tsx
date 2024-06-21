import React, { Dispatch, ReactElement, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

type GlobalContextType = {
    userName: string;
    setUserName: Dispatch<SetStateAction<string>>;
    attendeeId: string;
    setAttendeeId: Dispatch<SetStateAction<string>>;
}

export function useGlobalState(): GlobalContextType {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = (props: { children: ReactNode }): ReactElement => {
    const [userName, setUserName] = useState<string>('');
    const [attendeeId, setAttendeeId] = useState<string>('');

    return(
        <GlobalContext.Provider value={{userName, setUserName, attendeeId, setAttendeeId}}>
            {props.children}
        </GlobalContext.Provider>
    )
}
