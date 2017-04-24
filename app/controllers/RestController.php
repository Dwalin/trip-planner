<?php
//namespace RestApi\Api\Controllers;
use Phalcon\Mvc\Controller;
use Phalcon\Mvc\Dispatcher;
use Phalcon\Http\Request;
use Phalcon\Http\Response;

class RestController extends Controller {
    const DEFAULT_STATUS_CODE = 200;
    protected $statusCode;

    public function beforeExecuteRoute(Dispatcher $dispatcher) {

        if ( $this->dispatcher->getActionName() == 'login' || $this->dispatcher->getActionName() == 'register') {

        } else {
            if ($this->session->has("user")) {
                $user = $this->session->get("user");

//                $log = new Log();
//                $log->user = $user['id'];
//                $log->name = $user['name'];
//                $log->action = $this->dispatcher->getActionName();
//                $log->url = "";
//                $log->request = $this->dispatcher->getParams();
//
//                if ($log->save() == false) {
//                    foreach ($log->getMessages() as $message) {
//                        echo $message, "\n";
//                    }
//                }

                //print_r($name);
            } else {
                $this->response->setStatusCode(201, "Success");
                $this->response->setJsonContent(
                    array(
                        'status'   => 'Need to login',
                    )
                );
                $this->dispatcher->forward(
                    array(
                        "controller" => "Rest",
                        "action"     => "login"
                    )
                );

            }
        }

    }

    public function afterExecuteRoute(Dispatcher $dispatcher) {
        $this->prepareResponse($dispatcher->getReturnedValue());

    }

   protected function prepareResponse($payload) {
           $this->response->setContentType('application/json', 'UTF-8')
                          ->setStatusCode($this->getStatusCode(), $this->getStatusCodeDescription());
           if ($payload) {
               $this->response->setJsonContent($payload);
           }
       }

       protected function setStatusCode($code) {
           $this->statusCode = $code;
       }

       protected function getStatusCode() {
           return $this->statusCode ? $this->statusCode : self::DEFAULT_STATUS_CODE;
       }

       protected function getStatusCodeDescription() {
           return $this->config->codes[ $this->getStatusCode() ];
       }

    public function route404Action() {
        $this->setStatusCode(404);
    }

    public function loginAction() {
        $this->setStatusCode(404);
    }

/*    public function addHeader($header, $value) {
        $this->response->setHeader($header, $value);
    }

    public function getHeaders() {
        return $this->response->getHeaders();
    }*/
}