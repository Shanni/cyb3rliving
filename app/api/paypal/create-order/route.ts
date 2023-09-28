import getCurrentUser from "@/app/actions/getCurrentUser";
import { generateAccessToken } from "@/app/libs/paypal/generateAccessToken";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { PAYPAL_BASE_URL } from "@/app/utils/constants";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { id, dayCount } = body;

  const accessToken = await generateAccessToken();

  const listing = await prisma.listing.findUnique({
    where: {
      id,
    },
  });
  if (!listing) {
    return NextResponse.error();
  }
  const totalPrice = listing.price * dayCount;

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalPrice.toString(),
        },
      },
    ],
  };
  const url = `${PAYPAL_BASE_URL}/v2/checkout/orders`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    return NextResponse.error();
  }
  const data = await response.json();
  return NextResponse.json(data);
}
