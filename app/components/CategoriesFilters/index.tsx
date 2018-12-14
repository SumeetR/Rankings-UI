import * as React from 'react';
import styled from 'styles/styled-components';
import CategoryFilterButton from './CategoryFilterButton';
import CategoryFilterSection, { CategoryFilterProps } from './CategoryFilterSection';
import InfoPopover from './InfoPopover';

interface Props extends CategoryFilterProps {
  isOpen?: boolean;
}

interface State {
  isOpen: boolean;
}
class CategoriesFilters extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: props.isOpen || false,
    };
  }

  private handleClick = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };
  public render() {
    return (
      <React.Fragment>
        <ButtonSectionWrapper>
          <CategoryFilterButton
            isOpen={this.state.isOpen}
            onClick={this.handleClick}
          />
          <InfoPopover />
        </ButtonSectionWrapper>
        <CategoryFilterSection isOpen={this.state.isOpen} {...this.props} />
      </React.Fragment>
    );
  }
}

const ButtonSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

export default CategoriesFilters;
