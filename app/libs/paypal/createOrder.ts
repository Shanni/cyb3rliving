import axios from "axios";

type Order = {
  id: string;
  dayCount: number;
};

export const createOrder = async (order: Order) => {
  const res = await axios.post("/api/paypal/create-order", order);
  return res.data.id;
};
