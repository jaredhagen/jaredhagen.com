aws cloudformation create-stack --stack-name prod-jaredhagen-ui --template-body file://cloudfront-deploy/cloudformation.yml --parameters ParameterKey=Environment,ParameterValue=prod,ParameterKey,ParameterKey=NakedDomain,ParameterValue=jaredhagen.com