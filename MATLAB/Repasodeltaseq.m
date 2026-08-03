%Ejercicio 1
%Genera una funci´on llamada deltaseq(n0,n1,n2) que muestre una delta dentro del intervalo n1 a n2
%y localizada en un instante n0. Muestra el c´odigo y el resultado al profesor.

function Repasodeltaseq (n0,n1,n2)
  
if (n0>n1) && (n0<n2)

  n= n1:n2; x= (n==n0);
  stem(n,x);
  title('Representación delta de dirac')

end




end