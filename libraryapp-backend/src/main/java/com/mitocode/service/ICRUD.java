package com.mitocode.service;

import java.util.List;

public interface ICRUD<T,ID> {
    T save(T t);
    T update(ID id, T t) throws Exception;
    List<T> finAll();
    T finById(ID id);
    void delete(ID id);
}
