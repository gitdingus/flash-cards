import { redirect } from 'next/navigation';
import { populateNotifications } from "@/actions/notification-actions";
import Notification from '@/app/components/notification-tools/Notification';
import ResultsPerPageSelect from '@/app/user/notifications/ResultsPerPageSelect';

interface NotificationProps {
  searchParams: {
    page: string,
    results: string,
  }
}

export default async function Notifications(props: NotificationProps) {
  const DEFAULT_PAGE_NUM = 0;
  const DEFAULT_RESULT_COUNT = 10;
  let page = Number.parseInt(props.searchParams.page) || DEFAULT_PAGE_NUM;
  let results = Number.parseInt(props.searchParams.results) || DEFAULT_RESULT_COUNT;


  let { notifications, hasMore } = await populateNotifications({ page, results })

  const buildSearchParams = async (targetPage: number, targetResults: number) => {
    'use server';
    const searchParams = new URLSearchParams();

    if (targetPage !== 0) {
      searchParams.set('page', targetPage.toString());
    }

    if (targetResults !== DEFAULT_RESULT_COUNT) {
      searchParams.set('results', targetResults.toString());
    }

    if (searchParams.toString() === '') {
      return '';
    }

    return `?${searchParams.toString()}`
  }

  const changeResultsPerPage = async (targetResults: number) => {
    'use server';
    redirect(`/user/notifications${await buildSearchParams(page, targetResults)}`);
  }
  
  return (
    <div>
      <ResultsPerPageSelect changeAction={changeResultsPerPage}/>
      {
        notifications.map((notification) => {
          return (
            <Notification key={notification.id} notification={notification} />
          )
        })
      }
      {
        page > 0 &&
        <a href={`/user/notifications${await buildSearchParams(page - 1, results)}`}>Previous</a>
      }
      {
        hasMore &&
        <a href={`/user/notifications${await buildSearchParams(page + 1, results)}`}>Next</a>
      }
    </div>
  )
}