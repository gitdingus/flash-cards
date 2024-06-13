import { getSet } from "@/app/lib/data";
import { 
  removeLine, 
  editLine, 
  saveNewLine, 
  saveNewCard, 
  removeCard,
  editCardTitle, 
  updateSetInformation,
} from '@/actions/set-actions';
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
      submitAction={async ({newSet, cardsInSet}, formData) => {
        'use server';
        updateSetInformation(newSet);
      }}
      editCard={ async (card) => {
        'use server';
        // action only saves card title since lines get saved independently
        editCardTitle({
          ...card,
          inSet: set.id,
        });
      }}
      saveCard={ async (card) => {
        'use server';
        saveNewCard(card, set);
      }}
      removeCard={ async (card) => { 
        'use server';
        removeCard({
          ...card,
          inSet: set.id,
        });
      }}
      removeLine={removeLine}
      editLine={editLine}
      saveLine={saveNewLine}
    />
  )
}