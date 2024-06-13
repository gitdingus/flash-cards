import { getSet } from "@/app/lib/data";
import { auth } from "@/auth";
import SetInput from "@/app/components/set-tools/SetInput";

interface EditSetParams {
  params: {
    id: string,
  }
}
export default async function EditSet({ params }: EditSetParams) {
  const [set, session] = await Promise.all([
    getSet(params.id),
    auth(),
  ]);

  if (!set) {
    return <div>Not Found</div>
  }

  if (!session || session.user.userId !== set.owner) {
    return <div>Unauthorized</div>
  }

  return (
    <SetInput 
      set={set} 
      submitAction={async ({set, cardsInSet}, formData) => {
        'use server';
        console.log(set);
        console.log(cardsInSet);
        console.log('form data keys');
      }}
      editCard={ async (card) => {
        'use server';
        console.log(`card ${card.id} ${card.front.title} has been edited`);
      }}
      saveCard={ async (card) => {
        'use server';
        console.log(`card ${card.id} ${card.front.title} has been created`);
      }}
      removeCard={ async (card) => { 
        'use server';
        console.log(`removing card ${card.front.title}`); 
      }}
      removeLine={ async (line) => {
        'use server';
        console.log(`removing line ${line.id}: ${line.heading}`);
      }}
      editLine={ async (line) => {
        'use server';
        console.log(`editing line ${line.id} to ${line.heading}: ${line.content}`);
      }}
      saveLine={ async (line) => {
        'use server';
        console.log(`saving line ${line.id} ${line.heading} ${line.content}`);
      }}
    />
  )
}