import axios from "axios";
import { createContext, useEffect, useState } from "react";



export const UserContext = createContext(null);

export const UserProvider = (props) => {

    const [change, setChange] = useState(false);
    const [userData, setUserData] = useState(null);


    useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await axios.get(
                "http://localhost:8080/loggedInUser",
                { withCredentials: true }
            );

            if(res.data){
                setUserData(res.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    fetchUser();
}, [change]);

    return(
        <UserContext.Provider value={{change,setChange,userData,setUserData}}>
            {props.children}
        </UserContext.Provider>
    )
}

