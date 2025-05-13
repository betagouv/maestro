import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useAppDispatch } from 'src/hooks/useStore';
import { useFindProgrammingPlansQuery } from 'src/services/programming-plan.service';
import programmingPlanSlice from 'src/store/reducers/programmingPlanSlice';

interface Props {
  element: () => JSX.Element;
}

const YearRoute = ({ element }: Props) => {
  const dispatch = useAppDispatch();
  const { year } = useParams<{ year: string }>();
  const { isAuthenticated } = useAuthentication();

  const { data: programmingPlans } = useFindProgrammingPlansQuery(
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
