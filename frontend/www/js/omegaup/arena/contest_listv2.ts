import Vue from 'vue';
import { types } from '../api_types';
import arena_ContestList, {
  ContestFilter,
  ContestOrder,
  ContestTab,
  UrlParams,
} from '../components/arena/ContestListv2.vue';
import { OmegaUp } from '../omegaup';
import * as time from '../time';
import contestStore from './contestStore';

/**
 * Parses the sort order from URL parameter string.
 */
function parseSortOrder(sortOrderParam: string | null): ContestOrder {
  if (!sortOrderParam) return ContestOrder.None;
  switch (sortOrderParam) {
    case 'title':
      return ContestOrder.Title;
    case 'ends':
      return ContestOrder.Ends;
    case 'duration':
      return ContestOrder.Duration;
    case 'organizer':
      return ContestOrder.Organizer;
    case 'contestants':
      return ContestOrder.Contestants;
    case 'signedup':
      return ContestOrder.SignedUp;
    default:
      return ContestOrder.None;
  }
}

/**
 * Parses the filter from URL parameter string.
 */
function parseFilter(filterParam: string | null): ContestFilter {
  if (!filterParam) return ContestFilter.All;
  if (filterParam === 'signedup') {
    return ContestFilter.SignedUp;
  } else if (filterParam === 'recommended') {
    return ContestFilter.OnlyRecommended;
  }
  return ContestFilter.All;
}

/**
 * Parses the tab from URL parameter string or hash.
 */
function parseTab(tabNameParam: string | null, hash: string): ContestTab {
  // Check tab_name query parameter first
  if (tabNameParam) {
    switch (tabNameParam) {
      case 'future':
        return ContestTab.Future;
      case 'past':
        return ContestTab.Past;
      default:
        return ContestTab.Current;
    }
  }
  // Fall back to hash
  if (hash !== '') {
    switch (hash) {
      case 'future':
        return ContestTab.Future;
      case 'past':
        return ContestTab.Past;
      default:
        return ContestTab.Current;
    }
  }
  return ContestTab.Current;
}

/**
 * Parses all URL parameters into a structured object.
 */
function parseUrlParams(): {
  tab: ContestTab;
  page: number;
  sortOrder: ContestOrder;
  filter: ContestFilter;
  query: string;
} {
  const hash = window.location.hash ? window.location.hash.slice(1) : '';
  const urlParams = new URLSearchParams(window.location.search);

  const pageParam = urlParams.get('page');
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  return {
    tab: parseTab(urlParams.get('tab_name'), hash),
    page: isNaN(page) ? 1 : page,
    sortOrder: parseSortOrder(urlParams.get('sort_order')),
    filter: parseFilter(urlParams.get('filter')),
    query: urlParams.get('query') || '',
  };
}

OmegaUp.on('ready', () => {
  time.setSugarLocale();
  const payload = types.payloadParsers.ContestListv2Payload();
  contestStore.commit('updateAll', payload.contests);
  contestStore.commit('updateAllCounts', payload.countContests);

  // Parse initial URL parameters
  const initialParams = parseUrlParams();

  // Use reactive data for URL-derived state
  const urlState = Vue.observable({
    tab: initialParams.tab,
    page: initialParams.page,
    sortOrder: initialParams.sortOrder,
    filter: initialParams.filter,
    query: payload.query || initialParams.query,
  });

  // Handle browser back/forward button navigation
  window.addEventListener('popstate', async () => {
    const params = parseUrlParams();

    // Update reactive state - this will trigger Vue watchers in the component
    urlState.tab = params.tab;
    urlState.page = params.page;
    urlState.sortOrder = params.sortOrder;
    urlState.filter = params.filter;
    urlState.query = params.query;

    // Fetch the contest list for the restored state
    const requestParams: UrlParams = {
      page: params.page,
      tab_name: params.tab,
      query: params.query,
      sort_order: params.sortOrder,
      filter: params.filter,
    };

    await contestStore.dispatch('fetchContestList', {
      requestParams,
      name: params.tab,
    });
  });

  new Vue({
    el: '#main-container',
    components: { 'omegaup-arena-contestlist': arena_ContestList },
    data: () => ({
      urlState,
    }),
    render: function (createElement) {
      return createElement('omegaup-arena-contestlist', {
        props: {
          contests: contestStore.state.contests,
          countContests: contestStore.state.countContests,
          query: this.urlState.query,
          tab: this.urlState.tab,
          page: this.urlState.page,
          sortOrder: this.urlState.sortOrder,
          filter: this.urlState.filter,
          pageSize: payload.pageSize,
          loading: contestStore.state.loading,
        },
        on: {
          'fetch-page': async ({
            params,
            urlObj,
          }: {
            params: UrlParams;
            urlObj: URL;
          }) => {
            for (const [key, value] of Object.entries(params)) {
              if (value) {
                urlObj.searchParams.set(key, value.toString());
              } else {
                urlObj.searchParams.delete(key);
              }
            }
            window.history.pushState({}, '', urlObj);
            await contestStore.dispatch('fetchContestList', {
              requestParams: params,
              name: params.tab_name,
            });
          },
        },
      });
    },
  });
});
