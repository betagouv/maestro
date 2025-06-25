import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import programmingPlanSlice from 'src/store/reducers/programmingPlanSlice';
import { ApiClientContext } from '../../services/apiClient';

interface Props {
  element: () => React.JSX.Element;
}

const YearRoute = ({ element }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { year } = useParams<{ year: string }>();
  const { isAuthenticated } = useAuthentication();

  const { data: programmingPlans } = apiClient.useFindProgrammingPlansQuery(
    {},
    { skip: !isAuthenticated }
  );

  useEffect(() => {
    dispatch(
      programmingPlanSlice.actions.setProgrammingPlan(
        programmingPlans?.find(
          (plan) =>
            plan.year === (year ? Number(year) : new Date().getFullYear())
        )
      )
    );
  }, [year, programmingPlans, dispatch]);

  return element();
};

export default YearRoute;
