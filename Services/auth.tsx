import axios from "axios";
import { useEffect,useState } from "react";

// const URL = "https://rex-bk.truet.net";
console.log(process.env.NEXT_PUBLIC_API_URL)
// admin login api

export const adminLogin = async (email, password) => {
    try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, { email, password });
        return res.data;
    } catch (error) {
        if (error.response?.data?.msg) {
            throw new Error(error.response.data.msg);
        }
        throw new Error("Login failed. Please try again.");
    }
};
// Get user analytics
export const getAnalytics = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/useranalytics`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error("Failed to fetch analytics data");
    }
};
// get all users
export const retrieveAllRegisteredUsers = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/endusers/getAllUsers2`,
          {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
        );
        return response.data.users;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {

            return { data: { msg: "Something went wrong" } };
        }
    }
}
// delete user
export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/delete-user/db/${id}`)
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {
            return { data: { msg: "Something went wrong" } };
        }
    }
}
// get users with agents
export const retrieveAllRegisteredUsers2 = async () => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/endusers/getAllUsers`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {

            return { data: { msg: "Something went wrong" } };
        }
    }
}
//save user
export const addUser=async(userData)=>{

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/endusers/createUserByAdmin`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      return { data: { msg: "Something went wrong" } };
    }
  }
};


// delete agent permanently
export const deleteAgent = async (id) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/AgentDelete/hard/${id}`)
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {
            return { data: { msg: "Something went wrong" } };
        }
    }
}
// deactivate agent from retel 
export const deactivateAgent = async (id) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/delete-user-agent/${id}`)
       
        return response.data;
    } catch (error) {
        if (error.response) {
            return error.response;
        } else {
            return { data: { msg: "Something went wrong" } };
        }
    }
}

export const getRetellVoices=async()=>{
    const res=await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/voicelist/api`)
       
        return res.data.voices;
     
    
}

// export const getRetellVoices = async () => {
//   const res = await axios.get('https://api.retellai.com/list-voices', {
//     headers: {
//       Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
//     },
//   });
//   console.log(res)
//   return res.data;

// };
export const createAgent = async (data) => {
     const token=localStorage.getItem("token")
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/createAgent`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};


export const fetchAgentDetailById = async (data: { agentId: string; businessId: string }) => {
     const token=localStorage.getItem("token")
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/fetchAgentDetailsById`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // ensure token is defined
    },
  });
  return res.data; // should return { agent, business }
};
export const validateWebsite = async (websiteUrl) => {
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/validate-website`, { website: websiteUrl });
    return res.data;
  } catch (error) {
    console.error("Error validating website:", error);
    return { valid: false, reason: 'Error validating website' };
  }
};


export const countAgentsbyUserId = async (userId) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/listAgents?userId=${userId}`);
   
    return res.data.length  || 0;
  } catch (error) {
    console.error("Error fetching agent count:", error);
    return 0;
  }
};

export const check_Referral_Name_Exsitence = async (referalName) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/endusers/checkReferralNameExsitence?referalName=${encodeURIComponent(referalName)}`);
    
    return res.data  
  } catch (error) {
    console.error("Error fetching agent count:", error);
    return 0;
  }
};

export const check_email_Exsitence = async (email) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/endusers/checkEmailExistence?email=${encodeURIComponent(email)}`);
    return res.data  
  } catch (error) {
    console.error("Error fetching agent count:", error);
    return 0;
  }
};
export const updateAgent = async (agentId, updateData) => {
  const token=localStorage.getItem("token")
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/updateAgent/${agentId}`, updateData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};


export const listSiteMap = async (url) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/map/list-sitemap`,
      { url },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting agent file:",
      error.response?.data || error.message
    );
    throw new Error("Error deleting agent file");
  }
};
export const updateAgentWidgetDomain = async (id, url) => {
  const data = { url: url };
  const res = await axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}}/api/agent/updateAgentWidgetDomain/${id}`,
    data
  );
  return res.data;
};
export const fetchAvailablePhoneNumberByCountry = async (token , country_code, locality, administrative_area, startsWith, endsWith) => {
  let t = token
  
  try {
   const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/telnyx/available-numbers`, {
  params: {
    country_code,
    locality,
    administrative_area,
    starts_with: startsWith,
    ends_with: endsWith
  },
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${t}`,
  }
});
    return res.data;
  } catch (error) {
    console.log('error',error)
   return error.response?.data 
   
  }
}

export const createNumberOrder = async (token,phoneNumbers,agent_id) => {
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/telnyx/create-number-order`, { phoneNumbers: phoneNumbers ,agent_id:agent_id} , {
       headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
    })
    return res.data;
  } catch (error) {
    console.log(error)
  }
}

export const importPhoneToAgentFromAdmin = async (token,customPhoneInput, agentId) => {
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/telnyx/importPhoneToAgentFromAdmin`, { phone_number: customPhoneInput ,inbound_agent_id:agentId} , {
       headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
    })
    return res.data;
  } catch (error) {
    console.log(error)
  }
}


