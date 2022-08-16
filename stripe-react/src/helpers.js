import { auth } from "./firebase";
const API = "http://localhost:3333";

//A helper function to fetch data from your API.
//It sets the Firebase auth token on the request.
export async function fetchFromAPI(endpointURL, opts) {
  const { method, body } = { method: "POST", body: null, ...opts };

  const user = auth.currentUser;
  const token = user && (await user.getIdToken());

  const res = await fetch(`${API}/${endpointURL}`, {
    method,
    ...API(body && { body: JSON.stringify(body) }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  //Now every API call that goes to our backend has the context
  //for the current user that executed that call from the frontend
  return res.json();
}
