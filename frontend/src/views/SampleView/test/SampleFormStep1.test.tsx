import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import SampleFormStep1 from 'src/views/SampleView/SampleFormStep1';
import { genCoords } from '../../../../test/fixtures.test';

describe('SampleFormStep1', () => {
  const user = userEvent.setup();

  test('should display form', () => {
    render(<SampleFormStep1 onValid={() => {}} />);

    expect(screen.getByTestId('draft_sample_1_form')).toBeInTheDocument();
    expect(screen.getAllByTestId('department-select')).toHaveLength(2);
    expect(screen.getAllByTestId('resytalId-input')).toHaveLength(2);
    expect(screen.getAllByTestId('context-select')).toHaveLength(2);

    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  test('should handle errors on submitting', async () => {
    render(<SampleFormStep1 onValid={() => {}} />);
    const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];

    await act(async () => {
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText('Veuillez renseigner le département.')
    ).toBeInTheDocument();
    expect(
      screen.getByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).toBeInTheDocument();
    expect(
      screen.getByText('Veuillez renseigner le contexte.')
    ).toBeInTheDocument();

    await act(async () => {
      await user.type(resytalIdInput, '223aze12');
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.getByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).toBeInTheDocument();
  });

  test('should handle valid form', async () => {
    const onValid = jest.fn();
    render(<SampleFormStep1 onValid={onValid} />);

    const departmentSelect = screen.getAllByTestId('department-select')[1];
    const resytalIdInput = screen.getAllByTestId('resytalId-input')[1];
    const contextSelect = screen.getAllByTestId('context-select')[1];

    await act(async () => {
      (
        navigator.geolocation.getCurrentPosition as jest.Mock<any, any>
      ).mock.calls[0][0](genCoords());
    });

    await act(async () => {
      await user.selectOptions(departmentSelect, '08');
      await user.type(resytalIdInput, '22123456');
      await user.selectOptions(contextSelect, 'Surveillance');
      await user.click(screen.getByTestId('submit-button'));
    });
    expect(
      screen.queryByText('Veuillez renseigner le département.')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("L'identifiant Resytal doit être au format 22XXXXXX.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Veuillez renseigner le contexte.')
    ).not.toBeInTheDocument();
    expect(onValid).toHaveBeenCalled();
  });
});
