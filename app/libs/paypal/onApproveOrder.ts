import axios from "axios";

export const onApproveOrder = async (data: { orderID: string }) => {
  await axios.post("/api/paypal/capture-order", {
    orderID: data.orderID,
  });
};
