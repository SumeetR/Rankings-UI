import * as React from 'react';
import { Formik, FormikErrors, Field, Form } from 'formik';
import styled from 'styles/styled-components';
import { ContestFormValues } from './types';
import LoadableButton from 'components/LoadableButton';
import TextInput from './inputs/TextInput';
import * as Yup from 'yup';
import ImageUpload from './inputs/ImageUpload';
import DateInput from './inputs/DateInput';
import media from 'styles/media';
import Header from 'containers/AdminAthlete/Header';
import CategoryInput from './inputs/CategoryInput';
import DisciplineInput from './inputs/DisciplineInput';
import AutoCompleteTextInput from 'containers/AdminAthlete/inputs/AutoCompleteTextInput';
import { ISelectOption } from 'types/application';

interface Props {
  readonly values?: ContestFormValues | null;
  readonly countrySuggestions?: ISelectOption[];
  readonly categories: ISelectOption[];
  readonly disciplines: ISelectOption[];
  loadCountrySuggestions(value: string): void;
  pictureSelected(file: any): void;
  submit(values: ContestFormValues): Promise<void>;
}

interface State {}
class FormikForm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private initialValues(): ContestFormValues {
    let values = this.props.values;
    if (!values) {
      values = {
        id: '',
        name: '',
        country: '',
        city: '',
        contestCategory: -1,
        date: '',
        discipline: -1,
        prize: 0,
        profileUrl: '',
        infoUrl: '',
      };
    }
    return values;
  }
  private profilePictureSelected = (file: any) => {
    this.props.pictureSelected(file);
  };

  private validationSchema = Yup.object().shape({
    id: Yup.string(),
    name: Yup.string()
      .min(2, 'Too Short!')
      .max(25, 'Too Long!')
      .required('Required'),
    profileUrl: Yup.string().notRequired(),
    country: Yup.string()
      .min(1, 'Too Short!')
      .required('Required'),
    contestCategory: Yup.number()
      .min(0, 'Invalid Category')
      .required('Required'),
    date: Yup.string().required(),
    discipline: Yup.number()
      .min(1, 'Invalid Discipline')
      .required('Required'),
    city: Yup.string().min(2, 'Too Short!'),
    prize: Yup.number()
      .min(1, 'Invalid Prize')
      .required('Required'),
    infoUrl: Yup.string()
      .url('Invalid Url')
      .notRequired(),
  });

  public render() {
    const initialValues = this.initialValues();
    const disableNotEditableField = initialValues.id;
    return (
      <Wrapper>
        <Header>Contest</Header>
        <Formik<ContestFormValues>
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={this.validationSchema}
          // tslint:disable-next-line:jsx-no-lambda
          onSubmit={(values, { setSubmitting }) => {
            console.log(values);
            this.props.submit(values).then(_ => setSubmitting(false));
          }}
        >
          {({ isSubmitting }) => (
            <StyledForm>
              <Field name="name" component={TextInput} required />
              <Field name="city" component={TextInput} required />
              <Field
                name="country"
                component={AutoCompleteTextInput}
                suggestions={this.props.countrySuggestions}
                loadSuggestions={this.props.loadCountrySuggestions}
              />
              <Field name="date" component={DateInput} />
              <Field
                name="discipline"
                component={DisciplineInput}
                disciplines={this.props.disciplines}
                disabled={disableNotEditableField}
              />
              <Field
                name="prize"
                component={TextInput}
                label={'prize (in Euro)'}
                required
              />
              <Field
                name="contestCategory"
                component={CategoryInput}
                categories={this.props.categories}
              />
              <Field name="infoUrl" component={TextInput} label={'Info Url'} />

              <ImageUpload
                fileSelected={this.profilePictureSelected}
                url={initialValues.profileUrl}
              />

              <StyledLoadableButton
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Save
              </StyledLoadableButton>
            </StyledForm>
          )}
        </Formik>
      </Wrapper>
    );
  }
}

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-wrap: nowrap;

  ${media.tablet`
    flex-wrap: wrap;
    max-height: 450px;
  `};
`;

const StyledLoadableButton = styled(LoadableButton).attrs({
  type: 'submit',
})`
  margin-top: 16px;
  width: 128px;
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  /* padding: 32px; */
`;

export default FormikForm;
