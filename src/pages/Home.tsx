import { FC, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import qs from 'qs'

import Skeleton from '../components/PizzaBlock/Skeleton'
import Categories from '../components/Categories'
import PizzaBlock from '../components/PizzaBlock'
import Pagination from '../components/Pagination'
import { list } from '../components/Sort'
import Sort from '../components/Sort'

import { fetchPizzas } from '../redux/pizza/asyncActions'
import { selectFilter } from '../redux/filter/selectors'
import { SearchPizzaParams } from '../redux/pizza/types'
import { selectPizza } from '../redux/pizza/selectors'
import { setFilters } from '../redux/filter/slice'
import { useAppDispatch } from '../redux/store'

const Home: FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isSearch = useRef(false)
  const isMounted = useRef(false)

  const { searchValue, categoryId, sort, currentPage } = useSelector(selectFilter)
  const { items, status } = useSelector(selectPizza)

  const skeletons = [...new Array(6)].map((_, index) => <Skeleton key={index} />)
  const pizzas = items
    .filter((obj: any) => {
      if (obj.title.toLowerCase().includes(searchValue.toLowerCase())) {
        return true
      }
      return false
    })
    .map((obj: any) => <PizzaBlock key={obj.id} {...obj} />)

  const getPizzas = useCallback(async () => {
    const category = categoryId > 0 ? `category=${categoryId}` : ''
    const search = searchValue ? `&search=${searchValue}` : ''
    const sortBy = sort.sortProperty.replace('-', '')
    const order = sort.sortProperty.includes('-') ? 'asc' : 'desc'

    dispatch(
      fetchPizzas({
        category,
        search,
        sortBy,
        order,
        currentPage: String(currentPage),
      })
    )

    window.scrollTo(0, 0)
  }, [categoryId, currentPage, dispatch, searchValue, sort.sortProperty])

  useEffect(() => {
    if (isMounted.current) {
      const queryString = qs.stringify({
        sortProperty: sort.sortProperty,
        categoryId,
        currentPage,
      })
      navigate(`?${queryString}`)
    }
    isMounted.current = true
  }, [navigate, categoryId, sort, searchValue, currentPage])

  useEffect(() => {
    if (window.location.search) {
      const params = qs.parse(
        window.location.search.substring(1)
      ) as unknown as SearchPizzaParams
      const sort = list.find((obj) => obj.sortProperty === params.sortBy)

      dispatch(
        setFilters({
          searchValue: params.search,
          categoryId: Number(params.category),
          currentPage: Number(params.currentPage),
          sort: sort || list[0],
        })
      )

      isSearch.current = true
    }
  }, [dispatch])

  useEffect(() => {
    window.scrollTo(0, 0)

    if (!isSearch.current) {
      getPizzas()
    }

    isSearch.current = false
  }, [categoryId, sort, searchValue, currentPage, getPizzas])

  return (
    <div className='container'>
      <div className='content__top'>
        <Categories />
        <Sort />
      </div>
      <h2 className='content__title'>Все пиццы</h2>
      {status === 'error' ? (
        <div className='content__error-info'>
          <h2>
            Произошла ошибка <span>😕</span>
          </h2>
          <p>
            К сожалению, не удалось получить пиццы. Попробуйте повторить попытку позже.
          </p>
        </div>
      ) : (
        <div className='content__items'>{status === 'loading' ? skeletons : pizzas}</div>
      )}
      <Pagination />
    </div>
  )
}

export default Home
