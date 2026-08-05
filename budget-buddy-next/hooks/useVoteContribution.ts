import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { ResultAsync } from 'neverthrow';

const cookies = new Cookies();

const DEVELOPMENT = process.env.NEXT_PUBLIC_DEVELOPMENT === "true";
const LOCALHOST = process.env.NEXT_PUBLIC_LOCALHOST;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

const URL = DEVELOPMENT
    ? `http://${LOCALHOST}:5000/api/${API_VERSION}/contributions`
    : `https://iliganproductprice-mauve.vercel.app/api/${API_VERSION}/contributions`;

interface VoteVariables {
    id: string;
    voteType: string;
}

const useVoteContribution = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, voteType }: VoteVariables) => {
            const result = await ResultAsync.fromPromise(
                axios.post(
                    `${URL}/${id}/vote`,
                    { voteType },
                    { headers: { Authorization: `Bearer ${cookies.get("budgetbuddy_token")}` } }
                ),
                (error) => error // Catch it temporarily
            );

            if (result.isErr()) {
                throw result.error;
            }

            return result.value;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingContributions_User'] });
        }
    });
};

export default useVoteContribution;
