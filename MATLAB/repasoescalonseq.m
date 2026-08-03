%Ejercicio 2cGenera una función llamada escalonseq(n0,n1,n2) que muestre un escal´on unitario dentro del 
% intervalo n1 a n2 y que se inicie en un instante n0. Muestra el c´odigo y el resultado al profesor.

function repasoescalonseq (n0,n1,n2)

 if (n0<n1) || (n0>n2)

     error('El parámetro introducido no se encuentra en el intervalo.')
 end
  
  n=n1:n2; x= (n>= n0);
  stem(n,x); axis([n1*2 n2*2 0 1.2]);
  title('Representación escalón unitario');
end
