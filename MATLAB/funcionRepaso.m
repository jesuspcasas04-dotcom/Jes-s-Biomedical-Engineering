function[vector_salida]=ej_funcion(vector_entrada,umbral)
    %Ahora haremos un ejemplo de función para la práctica 1.

    %El vector_entrada será un vector de N elementos complejos que pasemos por parámetro
    %El umbral será el umbral de la parte real. 
    %
    %
    %El vector_salida será el vector resultado que devuelva la función.
    
    %Ahora calcularemos la longitud de nuestro vector de entrada.
    long=length(vector_entrada);

    %Ahora creamos el vector de salida el cual tendrá la misma longitud que
    %el vector de entrada.

    vector_salida=zeros(1,long);

    %Por último queremos ir metiendo en el vector de salida los módulos de
    %los números que superan el umbral pasado por parámetro.

    for i=1:long %Recorremos el vector de entrada...
        if real(vector_entrada(indice))>umbral %Si la parte real de nuestro vector de entrada supera el umbral lo añadimos al vector salida
            vector_salida(i)=abs(vector_entrada(i));
        else %Si no añademos al vector salida el número 99.
            vector_salida(i)=99;
        end

    end

end
