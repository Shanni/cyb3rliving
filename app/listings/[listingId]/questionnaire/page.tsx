import getCurrentUser from "@/app/actions/getCurrentUser";
import QuestionnaireClient from "./QuestionnaireClient";
import getSavedQuestions from "@/app/actions/getSavedQuestions";

type Props = {
  params: {
    listingId: string;
  };
};

const PaymentPage = async ({ params }: Props) => {
  const currentUser = await getCurrentUser();
  const savedQuestions = await getSavedQuestions();

  return (
    <QuestionnaireClient
      currentUser={currentUser}
      savedQuestions={savedQuestions}
      {...params}
    />
  );
};

export default PaymentPage;
