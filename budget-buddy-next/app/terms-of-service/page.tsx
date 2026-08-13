import { Metadata } from "next";
import DocumentPage from '@/components/parts/DocumentPage';
import { TERMS_OF_SERVICE_MD } from '@/data/terms-of-service';

export const metadata: Metadata = {
    title: "Terms of Service | Budget Buddy",
    description: "Read the rules and guidelines for using the Budget Buddy application.",
};

export default function TermsOfServicePage() {
    return <DocumentPage title="Terms of Service" content={TERMS_OF_SERVICE_MD} />;
}
