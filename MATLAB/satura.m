function satura(M)


   omega= linspace(-4*pi, 4*pi, 1000);
   X= exp(-1*2*omega).*((sin(5*omega/2))./ (sin(omega/2)));
   
   modulo_X_saturado=min(abs(X),M);

   X_saturado= modulo_X_saturado * exp(1j*angle(X));

   figure(1);

   subplot(211); plot(omega,modulo_X_saturado,'b.-'); xlabel('Omega'); ylabel('Módulo de función saturada'); title(['Representación del módulo de la funci' ...
       'on saturada frente a Omega ']);

   subplot(212); plot(omega,angle(X_saturado),'r.-'); xlabel('Omega');ylabel('Fase de la función saturada'); title(['Representación de la fase de la funci' ...
       'on saturada frente a Omega ']);

end

