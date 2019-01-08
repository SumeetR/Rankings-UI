import * as React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose, Dispatch } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import * as selectors from './selectors';
import * as actions from './actions';
import reducer from './reducer';
import saga from './saga';

import { RootState, ContainerState, ContestFormValues } from './types';

import Snackbar from 'components/Snackbar';
import { Storage } from 'aws-amplify';
import styled from 'styles/styled-components';
import TabPanel from 'components/TabPanel';
import Wrapper from './Wrapper';
import Header from 'containers/AdminAthlete/Header';
import FormikForm from './Form';
import AutoCompleteFilter from 'components/CategoriesFilters/AutoCompleteFilter';
import {
  APIAdminSubmitContestRequest,
  apiSubmitContest,
  apiSubmitContestPicture,
} from './api';
import { ISelectOption } from 'types/application';
import { AxiosError } from 'axios';

interface OwnProps {}

interface StateProps {
  contestFilter: ContainerState['contestFilter'];
  contest: ContainerState['contest'];
  countryFilter: ContainerState['countryFilter'];
  contestCategories: ContainerState['contestCategories'];
  disciplines: ContainerState['disciplines'];
}

interface DispatchProps {
  dispatch: Dispatch;
}

type Props = StateProps & DispatchProps & OwnProps;

interface State {
  snackbar: {
    open: boolean;
    message: string;
    type?: 'error' | 'success';
  };
}

class AdminContest extends React.PureComponent<Props, State> {
  private profilePicture: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      snackbar: {
        type: 'success',
        message: '',
        open: false,
      },
    };
    this.props.dispatch(actions.loadDisciplines());
    this.props.dispatch(actions.loadContestCategories());
  }

  private loadSuggestions = (value: string) => {
    this.props.dispatch(actions.loadContestSuggestions(value));
  };

  private selectSuggestion = (suggestion: ISelectOption) => {
    this.props.dispatch(
      actions.setContestFilterSelectedValue(suggestion),
    );
    if (suggestion.value.length > 0) {
      const [id, discipline] = suggestion.value.split(':');
      this.props.dispatch(actions.loadContest(id, parseInt(discipline, 10)));
    } else {
      if (this.props.contest) {
        const update = { ...this.props.contest, id: '' };
        this.props.dispatch(actions.setContest(update));
      }
    }
  };

  private loadCountrySuggestions = (value: string) => {
    this.props.dispatch(actions.loadCountrySuggestions(value));
  };

  private submit = async (values: ContestFormValues): Promise<void> => {
    const request: APIAdminSubmitContestRequest = {
      contest: {
        ...values,
        // contestCategory: values.contestCategory.id,
        // discipline: values.discipline.id,
      },
    };
    return apiSubmitContest(request)
      .then(async response => {
        let text = 'Saved Successfully.';
        if (this.profilePicture) {
          text += ' Uploading picture...';
        }
        this.openSnackbar(true, text, 'success');

        if (this.profilePicture) {
          await this.uploadProfilePicture(this.profilePicture, response.id, response.discipline);
        }

        this.props.dispatch(actions.clearForm());
      })
      .catch((err: AxiosError) => {
        const message = err.response
          ? err.response.data.message || err.message
          : err.message;
        this.openSnackbar(true, message, 'error');
      });
  };

  private openSnackbar = (
    state: boolean,
    message: string = '',
    type: State['snackbar']['type'] = 'success',
  ) => {
    if (state) {
      this.openSnackbar(false);
    }

    this.setState({ snackbar: { open: state, message: message, type: type } });
  };

  private onSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.openSnackbar(false);
  };

  private profilePictureSelected = (file: any) => {
    this.profilePicture = file;
  };

  private uploadProfilePicture = (file: any, id: string, discipline: number) => {
    const options = {
      contentType: 'image/png',
    };
    return Storage.put(`contest/${id}-${discipline}.png`, file, options)
      .then(async (result: any) => {
        return Storage.get(result.key).then((presignedUrl: string) => {
          const imageUrl = presignedUrl.split('?')[0];
          if (imageUrl) {
            return apiSubmitContestPicture({
              id: id,
              discipline: discipline,
              url: imageUrl,
            }).then(rsp => {
              this.openSnackbar(true, 'Picture Uploaded', 'success');
            });
          }
          return Promise.resolve();
        });
      })
      .catch((err: AxiosError) => {
        const message = err.response
          ? err.response.data.message || err.message
          : err.message;
        this.openSnackbar(true, message, 'error');
      });
  };

  public render() {
    const { countryFilter, contestCategories, disciplines } = this.props;
    let values: ContestFormValues | null = null;
    if (this.props.contest) {
      values = {
        ...this.props.contest,
        contestCategory: this.props.contest.contestCategory.id,
        discipline: this.props.contest.discipline.id,
      };
    }
    const formikKey = this.props.contest
      ? this.props.contest.id || undefined
      : undefined;
    return (
      <TabPanel>
        <Helmet>
          <title>Admin Contest</title>
          <meta name="description" content="Manage Contests" />
        </Helmet>
        <Wrapper>
          <Header>Modify Contest</Header>
          <StyledAutoCompleteFilter
            // key={this.props.contestFilter.selectedValue}
            title={'Name'}
            placeholder={'Search contest to modify'}
            loadSuggestions={this.loadSuggestions}
            suggestionSelected={this.selectSuggestion}
            suggestions={this.props.contestFilter.suggestions}
            selectedOption={this.props.contestFilter.selectedValue}
          />
          <FormikForm
            key={formikKey}
            values={values}
            countrySuggestions={countryFilter.suggestions}
            loadCountrySuggestions={this.loadCountrySuggestions}
            pictureSelected={this.profilePictureSelected}
            submit={this.submit}
            categories={contestCategories}
            disciplines={disciplines}
          />
        </Wrapper>
        <Snackbar
          open={this.state.snackbar.open}
          handleClose={this.onSnackbarClose}
          message={this.state.snackbar.message}
          type={this.state.snackbar.type}
        />
      </TabPanel>
    );
  }
}

const StyledAutoCompleteFilter = styled(AutoCompleteFilter)`
  width: 250px;
  margin-bottom: 32px;
  .react-autosuggest__input {
    width: 100%;
  }
`;

const mapStateToProps = createStructuredSelector<RootState, StateProps>({
  contestFilter: selectors.selectContestFilter(),
  contest: selectors.selectContest(),
  countryFilter: selectors.selectCountryFilter(),
  disciplines: selectors.selectDisciplines(),
  contestCategories: selectors.selectContestCategories(),
});

function mapDispatchToProps(
  dispatch: Dispatch,
  ownProps: OwnProps,
): DispatchProps {
  return {
    dispatch: dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

// <OwnProps> restricts access to the HOC's other props. This component must not do anything with reducer hoc
const withReducer = injectReducer<OwnProps>({
  key: 'adminContest',
  reducer: reducer,
});
// <OwnProps> restricts access to the HOC's other props. This component must not do anything with saga hoc
const withSaga = injectSaga<OwnProps>({ key: 'adminContest', saga: saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(AdminContest);
