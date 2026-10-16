package com.mitocode.service.impl;

import com.mitocode.exception.ModelNotFoundException;
import com.mitocode.repository.IGenericRepo;
import com.mitocode.service.ICRUD;

import java.lang.reflect.Method;
import java.util.List;

public abstract class CRUDImpl<T,ID> implements ICRUD<T,ID> {
    protected abstract IGenericRepo<T,ID> getRepo();
    @Override
    public T save(T t) {
        return getRepo().save(t);
    }

    @Override
    public T update(ID id, T t) throws Exception {
        var _ = finById(id);
        //JAVA API REFLECTION
        String className = t.getClass().getSimpleName();
        //setId + className
        String methodName = "setId" + className;
        Method setIdMethod = t.getClass().getMethod(methodName, id.getClass());
        setIdMethod.invoke(t, id);
        return getRepo().save(t);
    }

    @Override
    public List<T> finAll() {
        return getRepo().findAll();
    }

    @Override
    public T finById(ID id) {
        return getRepo().findById(id).orElseThrow(() -> new ModelNotFoundException("ID NOT FOUND: " + id));
    }

    @Override
    public void delete(ID id) {
        var _ = finById(id);
        getRepo().deleteById(id);
    }
}
