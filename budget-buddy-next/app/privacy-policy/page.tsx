import { Metadata } from "next";
import DocumentPage from '@/components/parts/DocumentPage';
import { PRIVACY_POLICY_MD } from '@/data/privacy-policy';

export const metadata: Metadata = {
    title: "Privacy Policy | Budget Buddy",
    description: "Learn how Budget Buddy collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
    return <DocumentPage title="Privacy Policy" content={PRIVACY_POLICY_MD} />;
}
